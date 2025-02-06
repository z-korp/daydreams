import { chainOfTought } from "./cot";
import { Agent, Config } from "./types";

export function createDreams(config: Config): Agent {
    const memory = {
        working: {
            inputs: [],
            outputs: [],
            thoughts: [],
            calls: [],
            chains: [],
        },
        shortTerm: {},
    };

    const agent: Agent = {
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
                actions: this.actions,
                inputs: agent.memory.working.inputs,
                outputs,
            });

            for (const thought of response.thinking) {
                this.emit("agent:thought", thought);
                this.memory.working.thoughts.push(thought);
            }

            for (let { type, data } of response.outputs) {
                const output = outputs.find((output) => output.type === type);

                if (!output) continue;

                try {
                    data = JSON.parse(data);
                } catch {}

                const response = {
                    type,
                    data: output.params.parse(data),
                };

                agent.emit("agent:output", response);

                agent.memory.working.outputs.push(response);
            }

            for (let { name, data } of response.actions) {
                const action = agent.actions.find(
                    (action) => action.name === name
                );

                if (!action) continue;

                const call = {
                    name,
                    data: action.params.parse(data),
                };

                this.emit("agent:action:call", call);
                this.memory.working.calls.push(call);
            }
        },

        send: async (input: { type: string; data: any }) => {
            if (input.type in this.inputs === false) return;

            const processor = this.inputs[input.type];

            const data = processor.schema.parse(input.data);
            const shouldContinue = await processor.handler(data, this);
            if (shouldContinue) await this.run();

            // await this.evaluator(agent.context, {});
        },
        // evaluator: async (ctx, {}) => {},
    };

    return agent;
}
