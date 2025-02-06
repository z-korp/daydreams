import { randomUUID } from "crypto";
import { chainOfTought } from "./cot";
import { ActionCall, Agent, AgentContext, AgentMemory, Config } from "./types";

export function createDreams(
    config: Config<AgentContext>
): Agent<AgentContext> {
    const memory: AgentMemory = {
        working: {
            inputs: [],
            outputs: [],
            thoughts: [],
            calls: [],
            chains: [],
        },
        shortTerm: {},
    };

    const agent: Agent<AgentContext> = {
        inputs: config.inputs,
        outputs: config.outputs,
        events: config.events,
        actions: config.actions,
        experts: config.experts,
        memory,

        emit: (...t: any) => {
            console.log(...t);
        },

        run: async () => {
            const outputs = Object.entries(agent.outputs).map(
                ([type, output]) => ({
                    type,
                    ...output,
                })
            );

            // const test = await chainOfExperts({
            //     model,
            //     state: {
            //         inputs: agent.memory.working.inputs,
            //     },
            //     experts: Object.entries(agent.experts).map(([k, v]) => ({
            //         name: k,
            //         ...v,
            //     })),
            // });

            // return;

            const response = await chainOfTought({
                model: config.model,
                plan: ``,
                actions: agent.actions,
                inputs: agent.memory.working.inputs,
                outputs,
            });

            for (const thought of response.thinking) {
                agent.emit("agent:thought", thought);
                agent.memory.working.thoughts.push(thought);
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

                agent.memory.working.outputs.push(response);

                await output.handler(data, agent);
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
                agent.memory.working.calls.push(call);

                const result = await action.handler(call.data, agent);

                call.result = result;
            }
        },

        send: async (input: { type: string; data: any }) => {
            if (input.type in agent.inputs === false) return;

            const processor = agent.inputs[input.type];

            const data = processor.schema.parse(input.data);
            const shouldContinue = await processor.handler(data, agent);
            if (shouldContinue) await agent.run();

            // await agent.evaluator(agent.context, {});
        },
        // evaluator: async (ctx, {}) => {},
    };

    return agent;
}
