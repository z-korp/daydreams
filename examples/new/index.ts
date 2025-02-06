import { z, ZodAnyDef } from "zod";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDreams } from "./dreams";
import { action, input } from "./utils";

const anthropic = createAnthropic({
    apiKey: "",
});

const model = anthropic("claude-3-5-haiku-latest");

const agent = createDreams({
    model,
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
        "user:message": input({
            schema: z.object({ user: z.string(), text: z.string() }),
            handler: (message, { memory }) => {
                memory.working.inputs.push({
                    type: "user:message",
                    data: message.text,
                    params: { user: message.user },
                });
                return true;
            },
        }),
    },

    events: {
        "agent:thought": z.object({}),
        "agent:output": z.object({}),
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
        action({
            name: "getWeather",
            description: "",
            params: z.object({
                location: z.string(),
            }),
            async handler(params, ctx) {},
        }),
    ],
});

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
