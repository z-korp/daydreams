import { z } from "zod";
import { createDreams } from "../../packages/core/src/core/v1/dreams";
import { action, input, output } from "../../packages/core/src/core/v1/utils";
import { DiscordClient } from "../../packages/core/src/core/v0/io/discord";
import { createGroq } from "@ai-sdk/groq";
import {
  InferMemoryFromHandler,
  LogLevel,
} from "../../packages/core/src/core/v1/types";
import {
  createContextHandler,
  createMemoryStore,
  defaultContext,
  defaultContextRender,
} from "@daydreamsai/core/src/core/v1/memory";

import { Research, startDeepResearch } from "./deep-research/research";
import { formatXml } from "@daydreamsai/core/src/core/v1/xml";
import { tavily } from "@tavily/core";
import { researchSchema } from "./deep-research/schemas";
import { Events, Message } from "discord.js";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const discord = new DiscordClient(
  {
    discord_token: process.env.DISCORD_TOKEN!,
    discord_bot_name: process.env.DISCORD_BOT_NAME!,
  },
  LogLevel.DEBUG
);

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

const contextHandler = createContextHandler(
  () => ({
    ...defaultContext(),
    researches: [] as Research[],
  }),
  (memory) => {
    return [
      ...defaultContextRender(memory),
      ...memory.researches.map((r) =>
        formatXml({
          tag: "research",
          params: { id: r.id },
          content: JSON.stringify(r),
        })
      ),
    ];
  }
);

const model = groq("deepseek-r1-distill-llama-70b");

type Handler = typeof contextHandler;
type Memory = InferMemoryFromHandler<Handler>;

async function main() {
  const agent = createDreams<Memory, Handler>({
    experts: {},
    logger: LogLevel.DEBUG,
    memory: createMemoryStore(),
    context: contextHandler,
    model,
    inputs: {
      "discord:message": input({
        schema: z.object({
          chat: z.object({ id: z.string() }),
          user: z.object({ id: z.string() }),
          text: z.string(),
        }),
        handler: (message, { memory }) => {
          memory.inputs.push({
            ref: "input",
            type: "discord:message",
            params: {
              channelId: message.chat.id,
              user: message.user.id,
            },
            data: message.text,
            timestamp: Date.now(),
          });

          return true;
        },
        subscribe(send) {
          function listener(message: Message) {
            send(`discord:${message.channelId}`, {
              chat: {
                id: message.channelId,
              },
              user: {
                id: message.member!.id,
              },
              text: message.content,
            });
          }

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
        handler: async (data, ctx) => {
          try {
            const channel = await discord.client.channels.fetch(data.channelId);
            if (channel && channel.isSendable()) {
              await channel.send(data.content);
              return true;
            }
          } catch (error) {
            console.error(error);
          }

          return false;
        },
      }),
    },

    actions: [
      action({
        name: "start-deep-research",
        schema: researchSchema,
        async handler(call, ctx) {
          const research: Research = {
            ...call.data,
            learnings: [],
            status: "in_progress",
          };

          console.log({ research });

          ctx.memory.researches.push(research);

          startDeepResearch({
            model,
            research,
            tavilyClient,
            maxDepth: 2,
          })
            .then((res) => {
              ctx.memory.results.push({
                ref: "action_result",
                callId: call.id,
                data: res,
                name: call.name,
                timestamp: Date.now(),
                processed: false,
              });

              return agent.run(ctx.id);
            })
            .catch((err) => console.error(err));

          return "Research created!";
        },
      }),
      action({
        name: "cancel-deep-research",
        schema: researchSchema,
        enabled: (ctx) => ctx.memory.researches.length > 0,
        async handler(params, ctx) {
          return "Research canceled!";
        },
      }),
    ],
  });

  console.log("Starting Daydreams Discord Bot...");
}

main().catch((err) => {
  console.log(err);
});
