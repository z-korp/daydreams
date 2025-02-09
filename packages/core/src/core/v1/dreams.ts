import { randomUUID } from "crypto";
import { chainOfThought } from "./cot";
import type {
    ActionCall,
    ActionResult,
    Agent,
    AgentContext,
    Config,
    Subscription,
} from "./types";
import { getOrCreateConversationMemory } from "./memory";
import { Logger } from "./logger";

export function createDreams(
    config: Config<AgentContext>
): Agent<AgentContext> {
    const inputSubscriptions = new Map<string, Subscription>();

    const logger = new Logger({
        level: config.logger,
        enableTimestamp: true,
        enableColors: true,
    });

    const { inputs, outputs, events, actions, experts, memory } = config;

    const agent: Agent<AgentContext> = {
        inputs,
        outputs,
        events,
        actions,
        experts,
        memory,

        emit: (event: string, data: any) => {
            logger.info("agent:event", event, data);
        },

        run: async (conversationId: string) => {
            const outputs = Object.entries(agent.outputs).map(
                ([type, output]) => ({
                    type,
                    ...output,
                })
            );

            const memory = await getOrCreateConversationMemory(
                agent.memory,
                conversationId
            );

            const maxSteps = 5;
            let step = 1;

            while (maxSteps >= step) {
                console.log({ step });

                const response = await chainOfThought({
                    model: config.model,
                    plan: ``,
                    actions: agent.actions,
                    inputs: [],
                    outputs,
                    logs: [
                        ...memory.inputs,
                        ...memory.outputs,
                        ...memory.calls,
                        ...memory.results,
                        // ...memory.thoughts,
                    ].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1)),
                });

                memory.inputs.forEach((i) => {
                    i.processed = true;
                });

                memory.results.forEach((i) => {
                    i.processed = true;
                });

                for (const thought of response.thinking) {
                    agent.emit("agent:thought", thought);
                    memory.thoughts.push(thought);
                }

                for (let { type, data } of response.outputs) {
                    const output = outputs.find(
                        (output) => output.type === type
                    );

                    if (!output) continue;

                    try {
                        data = JSON.parse(data);
                    } catch {
                        // continue;
                    }

                    data = output.params.parse(data);

                    const response = {
                        type,
                        data,
                    };

                    agent.emit("agent:output", response);

                    memory.outputs.push({
                        ref: "output",
                        ...response,
                        timestamp: Date.now(),
                    });

                    await output.handler(data, { conversationId, memory });
                }

                const newCalls: ActionCall[] = [];

                for (let call of response.actions) {
                    const action = agent.actions.find(
                        (action) => action.name === call.name
                    );

                    if (!action) continue;

                    newCalls.push(call);

                    agent.emit("agent:action:call", call);

                    memory.calls.push(call);

                    try {
                        const data = await action.handler(call.data, {
                            conversationId,
                            memory,
                        });

                        const result: ActionResult = {
                            ref: "action_result",
                            name: call.name,
                            callId: call.id,
                            data,
                            timestamp: Date.now(),
                            processed: false,
                        };

                        memory.results.push(result);
                    } catch (error) {
                        console.log("action failed");
                        console.error(error);
                    }
                }

                await agent.memory.set(conversationId, memory);

                if (
                    memory.results.filter((c) => c.processed !== true)
                        .length === 0
                )
                    break;

                step++;
            }
        },

        send: async (
            conversationId: string,
            input: { type: string; data: any }
        ) => {
            if (input.type in agent.inputs === false) return;

            const memory = await getOrCreateConversationMemory(
                agent.memory,
                conversationId
            );

            const processor = agent.inputs[input.type];

            const data = processor.schema.parse(input.data);

            const shouldContinue = await processor.handler(data, {
                conversationId,
                memory,
            });

            await agent.evaluator({
                conversationId,
                memory,
            });

            await agent.memory.set(conversationId, memory);

            if (shouldContinue) await agent.run(conversationId);
        },

        evaluator: async (ctx) => {
            const { conversationId, memory } = ctx;

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
