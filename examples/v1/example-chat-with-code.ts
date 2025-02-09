import { z } from "zod";
import { createDreams } from "../../packages/core/src/core/v1/dreams";
import {
    action,
    input,
    output,
} from "../../packages/core/src/core/v1/utils";
import { DiscordClient } from "../../packages/core/src/core/v0/io/discord";
import { LogLevel } from "../../packages/core/src/core/v1/types";
import { tavilySearch } from "../../packages/core/src/core/v1/actions/tavily";
import { createMemoryStore } from "../../packages/core/src/core/v1/memory";
import { Octokit } from "@octokit/rest";
import { google } from "@ai-sdk/google";

const discord = new DiscordClient({
    discord_token: process.env.DISCORD_TOKEN!,
    discord_bot_name: process.env.DISCORD_BOT_NAME!,
}, LogLevel.DEBUG);

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

async function main() {
    createDreams({
        logger: LogLevel.DEBUG,
        model: google("gemini-2.0-flash-001",),
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
                    const messageOutput = discord.createMessageOutput();

                    if (!messageOutput || !messageOutput.execute) {
                        throw new Error("Failed to create Discord message output");
                    }
                    const result = await messageOutput?.execute({
                        channelId: data.channelId,
                        content: data.content,
                    });
                    return !!result;
                },
            }),
        },

        actions: [
            action({ ...tavilySearch }),
            action({
                name: "fetchGitHubRepo",
                description: "Fetch and analyze contents of a GitHub repository",
                params: z.object({
                    owner: z.string().describe("The GitHub repository owner"),
                    repo: z.string().describe("The repository name"),
                    path: z.string().optional().describe("Optional specific path within the repository"),
                }),
                async handler(params) {
                    try {
                        const response = await octokit.repos.getContent({
                            owner: params.owner,
                            repo: params.repo,
                            path: params.path || '',
                        });

                        let contents = '';

                        if (Array.isArray(response.data)) {
                            for (const item of response.data) {
                                if (item.type === 'file' && item.name.match(/\.(ts|js|tsx|jsx|md|json)$/)) {
                                    const fileContent = await octokit.repos.getContent({
                                        owner: params.owner,
                                        repo: params.repo,
                                        path: item.path,
                                    });

                                    if ('content' in fileContent.data) {
                                        contents += `\n--- ${item.path} ---\n`;
                                        contents += Buffer.from(fileContent.data.content, 'base64').toString();
                                    }
                                } else if (item.type === 'dir') {
                                    const subContents = await this.handler({
                                        owner: params.owner,
                                        repo: params.repo,
                                        path: item.path,
                                    });
                                    contents += subContents.contents;
                                }
                            }
                        } else if ('content' in response.data) {
                            contents = Buffer.from(response.data.content, 'base64').toString();
                        }

                        return {
                            contents,
                            repoInfo: {
                                owner: params.owner,
                                repo: params.repo,
                                path: params.path || '',
                            }
                        };
                    } catch (error) {
                        console.error('Error fetching repo contents:', error);
                        throw new Error(`Failed to fetch repository contents: ${error.message}`);
                    }
                },
            }),
        ],
    });

    console.log("Starting GitHub Repo Chat Bot...");
}

main().catch((err) => {
    console.log(err);
});
