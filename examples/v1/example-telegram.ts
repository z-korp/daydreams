import { z } from "zod";
import { Telegraf } from "telegraf";
import { createGroq } from "@ai-sdk/groq";
import { tavily, TavilyClient } from "@tavily/core";
import {
  action,
  context,
  createContainer,
  createDreams,
  createMemoryStore,
  formatMsg,
  input,
  LogLevel,
  output,
  service,
  splitTextIntoChunks,
} from "@daydreamsai/core/v1";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const model = groq("deepseek-r1-distill-llama-70b");
const memory = createMemoryStore();

const container = createContainer().singleton("tavily", () =>
  tavily({
    apiKey: process.env.TAVILY_API_KEY!,
  })
);

const tgService = service({
  register(container) {
    container.singleton(
      "telegraf",
      () => new Telegraf(process.env.TELEGRAM_TOKEN!)
    );
  },
  async boot(container) {
    const telegraf = container.resolve<Telegraf>("telegraf");
    console.log("starting..");
    telegraf.launch({ dropPendingUpdates: true });
    const telegrafInfo = await telegraf.telegram.getMe();
    console.log(telegrafInfo);
  },
});

const telegramChat = context({
  type: "telegram:chat",
  key: ({ chatId }) => chatId.toString(),
  schema: z.object({ chatId: z.number() }),
  async setup(args, agent) {
    const telegraf = container.resolve<Telegraf>("telegraf");
    const chat = await telegraf.telegram.getChat(args.chatId);
    return {
      chat,
    };
  },
  description(params, { chat }) {
    if (chat.type === "private") {
      return `You are in private telegram chat with ${chat.username} id: ${chat.id}`;
    }
    return "";
  },
});

const agent = createDreams({
  logger: LogLevel.DEBUG,
  container,
  model,
  memory,
  services: [tgService],
  debugger: async (contextId, keys, data) => {
    const [type, id] = keys;
    await Bun.write(`./logs/tg/${contextId}/${id}-${type}.md`, data);
  },
  inputs: {
    "user:message": input({
      schema: z.object({ user: z.string(), text: z.string() }),
      format({ user, text }) {
        return formatMsg({
          role: "user",
          content: text,
          user: user.toString(),
        });
      },
    }),

    "telegram:direct": input({
      schema: z.object({
        user: z.object({ id: z.number(), username: z.string() }),
        text: z.string(),
      }),
      format: ({ user, text }) =>
        formatMsg({
          role: "user",
          content: text,
          user: user.username,
        }),
      subscribe(send, { container }) {
        container.resolve<Telegraf>("telegraf").on("message", (ctx) => {
          const chat = ctx.chat;
          const user = ctx.msg.from;

          if ("text" in ctx.message) {
            send(
              telegramChat,
              { chatId: chat.id },
              {
                user: {
                  id: user.id,
                  username: user.username!,
                },
                text: ctx.message.text,
              }
            );
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
    "telegram:direct": output({
      schema: z.object({
        userId: z
          .string()
          .describe("the userId to send the message to, you must include this"),
        content: z.string().describe("the content of the message to send"),
      }),
      description: "use this to send a telegram message to user",

      handler: async (data, ctx, agent) => {
        const tg = agent.container.resolve<Telegraf>("telegraf").telegram;
        const chunks = splitTextIntoChunks(data.content, {
          maxChunkSize: 4096,
        });

        for (const chunck of chunks) {
          await tg.sendMessage(data.userId, chunck);
        }

        return {
          data,
          timestamp: Date.now(),
        };
      },

      format: ({ data }) =>
        formatMsg({
          role: "assistant",
          content: data.content,
        }),
    }),
  },

  actions: [
    action({
      name: "getWeather",
      description: "",
      schema: z.object({
        location: z.string(),
      }),
      async handler(params, ctx) {
        return "Sunny";
      },
    }),

    action({
      name: "search",
      description: "Search online information using Tavily",
      schema: z.object({
        query: z.string().describe("The search query"),
        searchDepth: z
          .enum(["basic", "deep"])
          .optional()
          .describe(
            "The depth of search - basic is faster, deep is more thorough"
          ),
      }),

      async handler(call, ctx, agent) {
        const response = await agent.container
          .resolve<TavilyClient>("tavily")
          .search(call.data.query, {
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

await agent.start();
