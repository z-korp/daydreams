import { z } from "zod";
import {
  createDreams,
  createMemoryStore,
  createContainer,
  input,
  output,
  context,
  LogLevel,
  action,
  formatMsg,
} from "@daydreamsai/core/v1";
import { DiscordClient } from "@daydreamsai/core/io/discord";
import { Octokit } from "@octokit/rest";
import { google } from "@ai-sdk/google";
import { tavily } from "@tavily/core";
import { createGroq } from "@ai-sdk/groq";
import { Events, Message } from "discord.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const model = groq("deepseek-r1-distill-llama-70b");
const memory = createMemoryStore();

const container = createContainer()
  .instance("groq", groq)
  .instance("model", model)
  .instance("memory", memory)
  .singleton("tavily", () =>
    tavily({
      apiKey: process.env.TAVILY_API_KEY!,
    })
  )
  .singleton(
    "octokit",
    () =>
      new Octokit({
        auth: process.env.GITHUB_TOKEN,
      })
  )
  .singleton(
    "discord",
    () =>
      new DiscordClient(
        {
          discord_token: process.env.DISCORD_TOKEN!,
          discord_bot_name: process.env.DISCORD_BOT_NAME!,
        },
        LogLevel.DEBUG
      )
  );

container.resolve(tavily);

const discordChannelContext = context({
  type: "discord:channel",
  key: ({ channelId }) => channelId,
  schema: z.object({ channelId: z.string() }),
  async setup(args, agent) {
    const channel = await container
      .resolve<DiscordClient>("discord")
      .client.channels.fetch(args.channelId);

    if (!channel) throw new Error("Invalid channel");

    return { channel };
  },
});

createDreams({
  logger: LogLevel.DEBUG,
  model: google("gemini-2.0-flash-001"),
  memory: createMemoryStore(),
  inputs: {
    "discord:message": input({
      schema: z.object({
        chat: z.object({ id: z.string() }),
        user: z.object({ id: z.string(), name: z.string() }),
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
      subscribe(send, agent) {
        function listener(message: Message) {
          if (
            message.author.displayName ==
            container.resolve<DiscordClient>("discord").credentials
              .discord_bot_name
          ) {
            console.log(
              `Skipping message from ${container.resolve<DiscordClient>("discord").credentials.discord_bot_name}`
            );
            return;
          }
          send(
            discordChannelContext,
            { channelId: message.channelId },
            {
              chat: {
                id: message.channelId,
              },
              user: {
                id: message.member!.id,
                name: message.member!.displayName,
              },
              text: message.content,
            }
          );
        }

        const discord = agent.container.resolve<DiscordClient>("discord");

        discord.client.on(Events.MessageCreate, listener);
        return () => {
          discord.client.off(Events.MessageCreate, listener);
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
      schema: z.object({
        channelId: z
          .string()
          .describe("The Discord channel ID to send the message to"),
        content: z.string().describe("The content of the message to send"),
      }),
      description: "Send a message to a Discord channel",
      format: ({ content }) =>
        formatMsg({
          role: "assistant",
          content,
        }),
      handler: async (data, ctx) => {
        const channel = await container
          .resolve<DiscordClient>("discord")
          .client.channels.fetch(data.channelId);
        if (channel && channel.isSendable()) {
          await container.resolve<DiscordClient>("discord").sendMessage(data);
          return {
            data,
            timestamp: Date.now(),
          };
        }
      },
    }),
  },

  actions: [
    action({
      name: "fetchGitHubRepo",
      description: "Fetch and analyze contents of a GitHub repository",
      schema: z.object({
        owner: z.string().describe("The GitHub repository owner"),
        repo: z.string().describe("The repository name"),
        path: z
          .string()
          .optional()
          .describe("Optional specific path within the repository"),
      }),
      async handler({ data }, ctx, app) {
        const octokit = app.container.resolve<Octokit>("octokit");
        try {
          const response = await octokit.repos.getContent({
            owner: data.owner,
            repo: data.repo,
            path: data.path || "",
          });

          let contents = "";

          if (Array.isArray(response.data)) {
            for (const item of response.data) {
              if (
                item.type === "file" &&
                item.name.match(/\.(ts|js|tsx|jsx|md|json)$/)
              ) {
                const fileContent = await octokit.repos.getContent({
                  owner: data.owner,
                  repo: data.repo,
                  path: item.path,
                });

                if ("content" in fileContent.data) {
                  contents += `\n--- ${item.path} ---\n`;
                  contents += Buffer.from(
                    fileContent.data.content,
                    "base64"
                  ).toString();
                }
              } else if (item.type === "dir") {
                const subContents = await this.handler({
                  owner: data.owner,
                  repo: data.repo,
                  path: item.path,
                });
                contents += subContents.contents;
              }
            }
          } else if ("content" in response.data) {
            contents = Buffer.from(response.data.content, "base64").toString();
          }

          return {
            contents,
            repoInfo: {
              owner: data.owner,
              repo: data.repo,
              path: data.path || "",
            },
          };
        } catch (error) {
          console.error("Error fetching repo contents:", error);
          throw new Error(
            `Failed to fetch repository contents: ${error.message}`
          );
        }
      },
    }),
  ],
});

console.log("Starting GitHub Repo Chat Bot...");
