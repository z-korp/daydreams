import { z } from "zod";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDreams } from "../../packages/core/src/core/v1/dreams";
import {
    action,
    expert,
    input,
    output,
} from "../../packages/core/src/core/v1/utils";
import { Telegraf } from "telegraf";
import { createMemoryStore } from "../../packages/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { tavily } from "@tavily/core";
import { LogLevel } from "../../packages/core/src/core/v1/types";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!,
});

const telegraf = new Telegraf(process.env.TELEGRAM_TOKEN!);

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
});

async function main() {
    createDreams({
        logger: LogLevel.DEBUG,
        model: groq("deepseek-r1-distill-llama-70b"),
        memory: createMemoryStore(),
        experts: {
            analyser: expert({
                description: "Evaluates input context and requirements",
                instructions:
                    "Break down complex tasks, identify key components, assess dependencies",
            }),

            researcher: expert({
                description: "Gathers information and explores solutions",
                instructions:
                    "Search knowledge base, compare approaches, document findings",
                actions: [],
            }),

            planner: expert({
                description:
                    "Creates structured action plans and sequences tasks",
                instructions: "",
                actions: [],
            }),
        },

        inputs: {
            "user:message": input({
                schema: z.object({ user: z.string(), text: z.string() }),
                handler: (message, { memory }) => {
                    memory.inputs.push({
                        ref: "input",
                        type: "user:message",
                        params: { user: message.user },
                        data: message.text,
                        timestamp: Date.now(),
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
                    memory.inputs.push({
                        ref: "input",
                        type: "telegram:direct",
                        params: { user: message.user.id.toString() },
                        data: message.text,
                        timestamp: Date.now(),
                    });

                    return true;
                },
                subscribe(send) {
                    telegraf.on("message", (ctx) => {
                        const chat = ctx.chat;
                        const user = ctx.msg.from;

                        if ("text" in ctx.message) {
                            send(`tg:${chat.id}`, {
                                chat: {
                                    id: chat.id,
                                },
                                user: {
                                    id: user.id,
                                },
                                text: ctx.message.text,
                            });
                        }
                    });

                    return () => {};
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
                    chatId: z
                        .string()
                        .describe(
                            "the chat id to send the message to, you must include this"
                        ),
                    content: z
                        .string()
                        .describe("the content of the message to send"),
                }),
                description: "use this to send a telegram message to user",
                handler: async (data, ctx) => {
                    await telegraf.telegram.sendMessage(
                        data.chatId,
                        data.content
                    );
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
                    await telegraf.telegram.sendMessage(
                        data.groupId,
                        data.content
                    );
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
            action({
                name: "searchWeb",
                description:
                    "Search the web for current information using Tavily",
                params: z.object({
                    query: z.string().describe("The search query"),
                    searchDepth: z
                        .enum(["basic", "deep"])
                        .optional()
                        .describe(
                            "The depth of search - basic is faster, deep is more thorough"
                        ),
                }),
                async handler(params, ctx) {
                    const response = await tavilyClient.search(params.query, {
                        searchDepth: "advanced",
                    });

                    return {
                        results: response.results.map((result) => ({
                            title: result.title,
                            url: result.url,
                            content: result.content,
                        })),
                        totalResults: response.results.length,
                    };
                },
            }),
        ],
    });

    // input()
    console.log("starting..");
    telegraf.launch({ dropPendingUpdates: true });

    const telegrafInfo = await telegraf.telegram.getMe();

    console.log(telegrafInfo);
}

main().catch((err) => {
    console.log(err);
});
