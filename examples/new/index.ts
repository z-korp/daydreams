import { z, ZodAnyDef } from "zod";
import { createAnthropic } from "@ai-sdk/anthropic";
import { Action, WorkingMemory } from "./types";
import { chainOfExperts } from "./coe";
import { chainOfTought } from "./cot";

const anthropic = createAnthropic({
    apiKey: "",
});

const model = anthropic("claude-3-5-haiku-latest");

const agent = {
    memory: {
        working: {
            tasks: [],
            inputs: [],
            outputs: [],
            thoughts: [],
            calls: [],
            chains: [],
        } as WorkingMemory,

        shorTerm: {},
    },

    experts: {
        analyser: {
            description: "Evaluates input context and requirements",
            instructions:
                "Break down complex tasks, identify key components, assess dependencies",
        },
        researcher: {
            description: "Gathers information and explores solutions",
            instructions:
                "Search knowledge base, compare approaches, document findings",
            actions: [],
        },
        planner: {
            description: "Creates structured action plans and sequences tasks",
            instructions: "",
            actions: [],
        },
    },

    inputs: {
        "user:message": {
            schema: z.object({ user: z.string(), text: z.string() }),
            handler: (message) => {
                agent.memory.working.inputs.push({
                    type: "user:message",
                    data: message.text,
                    params: { user: message.user },
                });

                return true;
            },
        },
    },

    events: {
        "agent:thought": z.string(),
        "agent:output": z.any(),
    },

    outputs: {
        "chat:message": {
            params: z.string(),
            description: "use this to send a message to chat room",
        },

        "user:direct": {
            params: z.object({
                user: z.string(),
                content: z.string(),
            }),
            description: "use this to send a direct message to the user",
        },

        "agent:log": {
            params: z.string(),
            description: "use this to log something",
        },

        "twitter:post": {
            params: z.string(),
            description: "use this to send a twitter post",
        },
    },

    actions: [
        {
            name: "getWeather",
            description: "",
            params: z.object({
                location: z.string(),
            }),
        },
    ] as Action[],

    emit: (...t: any) => {
        console.log(...t);
    },

    run: async () => {
        const outputs = Object.entries(agent.outputs).map(([type, config]) => ({
            type,
            ...config,
        }));

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
            model,
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
            } catch {}

            const response = {
                type,
                data: output.params.parse(data),
            };

            agent.emit("agent:output", response);

            agent.memory.working.outputs.push();
        }

        for (let { name, data } of response.actions) {
            const action = agent.actions.find((action) => action.name === name);

            if (!action) continue;

            const call = {
                name,
                data: action.params.parse(data),
            };
            agent.emit("agent:action:call", call);
            agent.memory.working.calls.push(call);
        }
    },

    // evaluator: async (ctx, {}) => {},

    send: async (input: { type: string; data: any }) => {
        if (input.type in agent.inputs === false) return;

        const processor = agent.inputs[input.type] as {
            schema: z.AnyZodObject;
            handler: (t: any, agent: any) => Promise<any>;
        };

        const data = processor.schema.parse(input.data);

        const shouldContinue = await processor.handler(data, agent);

        if (shouldContinue) await agent.run();

        // await agent.evaluator(agent.context, {});
    },
};

async function main() {
    await agent.send({
        type: "user:message",
        data: {
            user: "ze",
            text: "what do you know about eternum?",
        },
    });
}

main();
