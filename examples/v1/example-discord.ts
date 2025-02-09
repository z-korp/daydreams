import { z } from "zod";
import { createDreams } from "../../packages/core/src/core/v1/dreams";
import {
    action,
    input,
    output,
} from "../../packages/core/src/core/v1/utils";
import { DiscordClient } from "../../packages/core/src/core/v0/io/discord";
import { createMemoryStore } from "../../packages/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { tavily } from "@tavily/core";
import { LogLevel } from "../../packages/core/src/core/v1/types";

const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY!,
});

const tavilyClient = tavily({
    apiKey: process.env.TAVILY_API_KEY!,
});

const discord = new DiscordClient({
    discord_token: process.env.DISCORD_TOKEN!,
    discord_bot_name: process.env.DISCORD_BOT_NAME!,
}, LogLevel.DEBUG);

async function main() {
    createDreams({
        logger: LogLevel.DEBUG,
        model: groq("deepseek-r1-distill-llama-70b"),
        memory: createMemoryStore(),
        inputs: {
            "discord:message": input({
                schema: z.object({
                    chat: z.object({ id: z.number() }),
                    user: z.object({ id: z.string() }),
                    text: z.string(),
                }),
                handler: (message, { memory }) => {

                    memory.inputs.push({
                        ref: "input",
                        type: "discord:message",
                        params: { user: message.user.id.toString() },
                        data: message.text,
                        timestamp: Date.now(),
                    });

                    return true;
                },
                subscribe(send) {
                    discord.startMessageStream((content) => {
                        if ('data' in content) {
                            send(`discord:${content.threadId}`, {
                                chat: {
                                    id: parseInt(content.threadId),
                                },
                                user: {
                                    id: content.threadId,
                                },
                                text: content.data && typeof content.data === 'object' && 'content' in content.data ? content.data.content as string : '',
                            });
                        }
                    });

                    return () => {
                        discord.stopMessageStream();
                    };
                },
            }),
        },

        events: {
            "agent:thought": z.object({}),
            "agent:output": z.object({}),
        },

        outputs: {
            "discord:message": output({
                params: z.object({
                    channelId: z.string().describe("The Discord channel ID to send the message to"),
                    content: z.string().describe("The content of the message to send"),
                }),
                description: "Send a message to a Discord channel",
                handler: async (data, ctx) => {
                    const result = await discord.createMessageOutput().execute({
                        channelId: data.channelId,
                        content: data.content,
                    });
                    return !!result;
                },
            }),
        },

        actions: [
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

    console.log("Starting Daydreams Discord Bot...");
}

main().catch((err) => {
    console.log(err);
});
