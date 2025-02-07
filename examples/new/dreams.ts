import { randomUUID } from "crypto";
import { chainOfTought } from "./cot";
import { ActionCall, Agent, AgentContext, Config, Subscription } from "./types";
import { getOrConversationMemory } from "./memory";

export function createDreams(
    config: Config<AgentContext>
): Agent<AgentContext> {
    const inputSubscriptions = new Map<string, Subscription>();

    const agent: Agent<AgentContext> = {
        inputs: config.inputs,
        outputs: config.outputs,
        events: config.events,
        actions: config.actions,
        experts: config.experts,
        memory: config.memory,

        emit: (...t: any) => {
            console.log(...t);
        },

        run: async (conversationId: string) => {
            const outputs = Object.entries(agent.outputs).map(
                ([type, output]) => ({
                    type,
                    ...output,
                })
            );

            const memory = await getOrConversationMemory(
                agent.memory,
                conversationId
            );

            const response = await chainOfTought({
                model: config.model,
                plan: ``,
                actions: agent.actions,
                inputs: memory.inputs,
                outputs,
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

                memory.outputs.push(response);

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
            }

            await agent.memory.set(conversationId, memory);
        },

        send: async (
            conversationId: string,
            input: { type: string; data: any }
        ) => {
            if (input.type in agent.inputs === false) return;

            const memory = await getOrConversationMemory(
                agent.memory,
                conversationId
            );

            const processor = agent.inputs[input.type];

            const data = processor.schema.parse(input.data);

            const shouldContinue = await processor.handler(data, {
                conversationId,
                memory,
            });

            await agent.memory.set(conversationId, memory);

            if (shouldContinue) await agent.run(conversationId);

            // await agent.evaluator(agent.context, {});
        },

        // evaluator: async (ctx, {}) => {},
    };

    for (const [key, input] of Object.entries(agent.inputs)) {
        if (input.subscribe) {
            const subscription = input.subscribe((conversationId, data) => {
                console.log({ conversationId, data });
                agent.send(conversationId, { type: key, data }).catch((err) => {
                    console.error(err);
                });
            });

            inputSubscriptions.set(key, subscription);
        }
    }

    return agent;
}
