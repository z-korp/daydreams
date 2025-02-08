import { randomUUID } from "crypto";
import { chainOfThought } from "./cot";
import type {
    ActionCall,
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

        emit: (...t: any) => {
            logger.info("agent", "emit", ...t);
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

            const response = await chainOfThought({
                model: config.model,
                plan: ``,
                actions: agent.actions,
                inputs: memory.inputs,
                outputs,
                thoughts: memory.thoughts,
                conversation: memory.outputs, // TODO:
            });

            for (const thought of response.thinking) {
                agent.emit("agent:thought", thought);
                memory.thoughts.push(thought);
            }

            for (let { type, data } of response.outputs) {
                const output = outputs.find((output) => output.type === type);

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
                    ...response,
                    timestamp: Date.now(),
                });

                await output.handler(data, { conversationId, memory });
            }

            for (let { name, data } of response.actions) {
                const action = agent.actions.find(
                    (action) => action.name === name
                );

                if (!action) continue;

                const call: ActionCall = {
                    id: randomUUID(),
                    name,
                    data: action.params.parse(data),
                };

                agent.emit("agent:action:call", call);

                memory.calls.push(call);

                const result = await action.handler(call.data, {
                    conversationId,
                    memory,
                });

                call.result = result;

                // After action completes, trigger a new evaluation and response
                await agent.send(conversationId, {
                    type: "action_result",
                    data: {
                        action: name,
                        result: result,
                    },
                });
            }

            await agent.memory.set(conversationId, memory);
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
                    logger.error("agent", "input", err);
                });
            });

            inputSubscriptions.set(key, subscription);
        }
    }

    return agent;
}
