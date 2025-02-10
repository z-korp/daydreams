import { chainOfThought } from "./cot";

import type {
    ActionCall,
    ActionResult,
    Agent,
    AgentContext,
    Config,
    ContextHandler,
    InferContextFromHandler,
    Subscription,
    WorkingMemory,
} from "./types";
import {
    createContextHandler,
    defaultContext,
    defaultContextRender,
    getOrCreateConversationMemory,
} from "./memory";
import { Logger } from "./logger";
import { llm } from "./llm";
import { render } from "./utils";
import {
    formatAction,
    formatContext,
    formatOutputInterface,
} from "./formatters";
import { createTagParser, createTagRegex, formatXml } from "./xml";
import { chainExpertManagerPrompt } from "./coe";
import { generateText } from "ai";
import { format } from "path";

const prompt = `
You are tasked with analyzing messages, formulating responses, and initiating actions based on a given context. 
You will be provided with a set of available actions, outputs, and a current context. 
Your instructions is to analyze the situation and respond appropriately.

Here are the available actions you can initiate:
<available_actions>
{{actions}}
</available_actions>

Here are the available outputs you can use:
<outputs>
{{outputs}}
</outputs>

Here is the current context:
<context>
{{context}}
</context>

Now, analyze the following new context:
<context>
{{updates}}
</context>

Here's an example of how to structure your response:

<response>
<reasoning>
[Your reasoning of the context, think, messages, and planned actions]
</reasoning>
[List of async actions to be initiated, if applicable]
<action name="[Action name]">[action arguments using the schema as JSON]</action>
[output to the user message, if applicable]
<output type="[Output type]>
[output content]
</output>
</response>
`;

function createParser() {
    const thinkParser = createTagParser("think");
    const responseParser = createTagParser("response");
    const actionParser = createTagParser("action", (t) => JSON.parse(t));
    const reasoningParser = createTagParser("reasoning");
    const outputParser = createTagParser("output");

    return (content: string) => {
        const think = thinkParser(content);

        const [response] = responseParser(content);

        const outputs = outputParser(response.content);

        // console.log({ output });

        const actions = actionParser(response.content);
        const reasonings = reasoningParser(response.content);

        return {
            think,
            response,
            reasonings,
            actions,
            outputs,
        };
    };
}

const parse = createParser();

const defaultContextHandler: ContextHandler = createContextHandler(
    defaultContext,
    defaultContextRender
);

export function createDreams<
    Memory extends WorkingMemory = WorkingMemory,
    Handler extends ContextHandler<Memory> = ContextHandler<Memory>,
>(config: Config<Memory, Handler>): Agent<Memory, Handler> {
    const inputSubscriptions = new Map<string, Subscription>();

    const logger = new Logger({
        level: config.logger,
        enableTimestamp: true,
        enableColors: true,
    });

    const { inputs, outputs, events, actions, experts, memory } = config;

    const contextHandler =
        config.context ?? (defaultContextHandler as unknown as Handler);

    const contextsRunning = new Set<string>();

    const agent: Agent<Memory, Handler> = {
        inputs,
        outputs,
        events,
        actions,
        experts,
        memory,
        context: contextHandler,
        emit: (event: string, data: any) => {
            logger.info("agent:event", event, data);
        },

        run: async (contextId: string) => {
            if (contextsRunning.has(contextId)) return;
            contextsRunning.add(contextId);

            const context = contextHandler(agent.memory);

            const outputs = Object.entries(agent.outputs).map(([type, output]) => ({
                type,
                ...output,
            }));

            const ctx = await context.get(contextId);

            const { memory } = ctx;

            const maxSteps = 5;
            let step = 1;

            const newInputs = memory.inputs.filter((i) => i.processed !== true);

            while (true) {
                const system = render(prompt, {
                    context: context.render(ctx.memory),
                    outputs: outputs.map(formatOutputInterface),
                    actions: actions
                        .filter((action) =>
                            action.enabled ? action.enabled(ctx as any) : true
                        )
                        .map(formatAction),
                    updates: [
                        ...newInputs,
                        ...memory.results.filter((i) => i.processed !== true),
                    ].map(formatContext),
                });

                console.log("==========");
                console.log(system);
                console.log("==========");
                const result = await generateText({
                    model: config.reasioningModel ?? config.model,
                    system,
                    messages: [
                        {
                            role: "assistant",
                            content: "<think>",
                        },
                    ],
                    stopSequences: ["</response>"],
                });

                const text = "<think>" + result.text + "</response>";
                console.log(text);

                const data = parse(text);

                console.dir(data, {
                    depth: Infinity,
                });

                memory.inputs.forEach((i) => {
                    i.processed = true;
                });

                memory.results.forEach((i) => {
                    i.processed = true;
                });

                for (const { content } of data.think) {
                    console.log("Think:\n" + content);
                }

                for (const { content } of data.reasonings) {
                    console.log("Reasoning:\n" + content);
                }

                for (const { params, content } of data.outputs) {
                    const output = config.outputs[params.type];
                    try {
                        await output.handler(
                            output.schema.parse(content),
                            ctx as InferContextFromHandler<Handler>
                        );
                    } catch (error) { }
                }

                await Promise.allSettled(
                    data.actions.map(async ({ params, content }) => {
                        const action = config.actions.find((a) => a.name === params.name);

                        if (!action) {
                            console.log("ACTION MISMATCH", { params, content });
                            return Promise.reject(new Error("ACTION MISMATCH"));
                        }

                        try {
                            const call: ActionCall = {
                                ref: "action_call",
                                id: randomUUID(),
                                data: action.schema.parse(content),
                                name: params.name,
                                timestamp: Date.now(),
                            };

                            memory.calls.push(call);
                            const result = await action.handler(
                                call,
                                ctx as InferContextFromHandler<Handler>
                            );

                            memory.results.push({
                                ref: "action_result",
                                callId: call.id,
                                data: result,
                                name: call.name,
                                timestamp: Date.now(),
                                processed: false,
                            });
                        } catch (error) {
                            console.log("ACTION FAILED", { error });

                            throw error;
                        }
                    })
                );

                break;
            }

            await context.save(contextId, memory);

            contextsRunning.delete(contextId);
        },

        send: async (
            conversationId: string,
            input: { type: string; data: any }
        ) => {
            if (input.type in agent.inputs === false) return;
            const context = contextHandler(agent.memory);

            const { memory } = await context.get(conversationId);

            const processor = agent.inputs[input.type];

            const data = processor.schema.parse(input.data);

            const shouldContinue = await processor.handler(data, {
                id: conversationId,
                memory,
            } as any);

            await agent.evaluator({
                id: conversationId,
                memory,
            } as any);

            await agent.memory.set(conversationId, memory);

            if (shouldContinue) await agent.run(conversationId);
        },

        evaluator: async (ctx) => {
            const { id, memory } = ctx;
            console.log("evaluator", memory);
        },
    };

    for (const [key, input] of Object.entries(agent.inputs)) {
        if (input.subscribe) {
            const subscription = input.subscribe((conversationId, data) => {
                logger.info("agent", "input", { conversationId, data });
                agent.send(conversationId, { type: key, data }).catch((err) => {
                    console.error(err);
                    // logger.error("agent", "input", err);
                });
            });

            inputSubscriptions.set(key, subscription);
        }
    }

    return agent;
}
