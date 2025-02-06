import { z, ZodAnyDef } from "zod";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDreams } from "./dreams";
import { action, input, output } from "./utils";
import { Telegraf } from "telegraf";

const anthropic = createAnthropic({
    apiKey: "",
});

const model = anthropic("claude-3-5-haiku-latest");

const telegraf = new Telegraf("");

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
                    params: { user: message.user },
                    data: message.text,
                });

                return true;
            },
        }),

        "telegram:direct": input({
            schema: z.object({
                chat: z.object({ id: z.number() }),
                user: z.object({ id: z.number() }),
                text: z.string(),
            }),
            handler: (message, { memory }) => {
                memory.working.inputs.push({
                    type: "telegram:direct",
                    params: { user: message.user.id.toString() },
                    data: message.text,
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
        "chat:message": output({
            params: z.object({
                user: z.string(),
                content: z.string(),
            }),
            description: "use this to send a message to chat room",
            handler: (data, ctx) => {
                console.log();

                return true;
            },
        }),

        "user:direct": output({
            params: z.object({
                user: z.string(),
                content: z.string(),
            }),
            description: "use this to send a direct message to the user",
            handler: (data, ctx) => {
                return true;
            },
        }),

        "agent:log": output({
            params: z.object({ content: z.string() }),
            description: "use this to log something",
            handler: (data, ctx) => {
                return true;
            },
        }),

        "twitter:post": output({
            params: z.object({ content: z.string() }),
            description: "use this to send a twitter post",
            handler: (data, ctx) => {
                return true;
            },
        }),

        "telegram:direct": output({
            params: z.object({
                chatId: z.string(),
                content: z.string(),
            }),
            description: "use this to send a telegram message to user",
            handler: async (data, ctx) => {
                await telegraf.telegram.sendMessage(data.chatId, data.content);
                return true;
            },
        }),

        "telegram:group": output({
            params: z.object({
                groupId: z.string(),
                content: z.string(),
            }),
            description: "use this to send a telegram message to a group",
            handler: async (data, ctx) => {
                await telegraf.telegram.sendMessage(data.groupId, data.content);
                return true;
            },
        }),
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
    // input()
    console.log("starting..");
    telegraf.launch({ dropPendingUpdates: true });

    const telegrafInfo = await telegraf.telegram.getMe();

    console.log(telegrafInfo);

    telegraf.on("message", (ctx) => {
        const chat = ctx.chat;
        const user = ctx.msg.from;

        console.log("here", ctx);

        if ("text" in ctx.message) {
            const isPrivate = chat.type === "private";

            agent.send({
                type: isPrivate ? "telegram:direct" : "telegram:group",
                data: {
                    chat: {
                        id: chat.id,
                        title: isPrivate ? "Private chat" : chat.title,
                    },
                    user: {
                        id: user.id,
                        name: user.username,
                    },
                    text: ctx.message.text,
                },
            });
        }
    });

    // await agent.send({
    //     type: "user:message",
    //     data: {
    //         user: "ze",
    //         text: "what do you know about eternum?",
    //     },
    // });
}

main().catch((err) => {
    console.log(err);
});
