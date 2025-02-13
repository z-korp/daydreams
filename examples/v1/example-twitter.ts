import { z } from "zod";
import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import {
  action,
  context,
  input,
  output,
  splitTextIntoChunks,
} from "@daydreamsai/core/src/core/v1/utils";
import { createMemoryStore } from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { LogLevel, WorkingMemory } from "@daydreamsai/core/src/core/v1/types";
import createContainer from "@daydreamsai/core/src/core/v1/container";
import { service } from "@daydreamsai/core/src/core/v1/serviceProvider";
import { TwitterClient } from "@daydreamsai/core/src/core/v1/io/twitter";
import { formatMsg, formatXml } from "@daydreamsai/core/src/core/v1";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const model = groq("deepseek-r1-distill-llama-70b");
const memory = createMemoryStore();

// Define Twitter context
const twitterContext = context({
  type: "twitter:thread",
  key: ({ tweetId }) => tweetId.toString(),
  schema: z.object({
    tweetId: z.string(),
  }),
});

// Twitter service setup
const twitterService = service({
  register(container) {
    container.singleton(
      "twitter",
      () =>
        new TwitterClient({
          username: process.env.TWITTER_USERNAME!,
          password: process.env.TWITTER_PASSWORD!,
          email: process.env.TWITTER_EMAIL!,
        })
    );
  },
  async boot(container) {
    const twitter = container.resolve<TwitterClient>("twitter");

    twitter.initialize();
    console.log("Twitter client initialized");
  },
});

const agent = createDreams<WorkingMemory>({
  logger: LogLevel.DEBUG,
  container: createContainer(),
  model,
  memory,
  services: [twitterService],
  inputs: {
    "twitter:mentions": input({
      schema: z.object({
        userId: z.string(),
        tweetId: z.string(),
        text: z.string(),
      }),
      handler: (mention, { memory }) => {
        memory.inputs.push({
          ref: "input",
          type: "twitter:mentions",
          params: {
            userId: mention.userId,
            tweetId: mention.tweetId,
            text: mention.text,
          },
          data: mention,
          timestamp: Date.now(),
        });
        return true;
      },
      subscribe(send, { container }) {
        const twitter = container.resolve<TwitterClient>("twitter");

        // Check mentions every minute
        const interval = setInterval(async () => {
          const mentions = await twitter.checkMentions();

          for (const mention of mentions) {
            console.log("Mention", mention);
            send(
              twitterContext,
              { tweetId: mention.metadata.tweetId || "" },
              {
                tweetId: mention.metadata.tweetId || "",
                userId: mention.metadata.userId || "",
                text: mention.content,
              }
            );
          }
        }, 10000);

        return () => clearInterval(interval);
      },
    }),
  },

  outputs: {
    "twitter:reply": output({
      schema: z.object({
        content: z.string().max(280),
        inReplyTo: z.string(),
      }),
      description: "Use this to reply to a tweet",

      handler: async (data, ctx, agent) => {
        const twitter = agent.container.resolve<TwitterClient>("twitter");
        const { tweetId } = await twitter.sendTweet({
          content: data.content,
          inReplyTo: data.inReplyTo,
        });

        return {
          data: {
            ...data,
            tweetId,
          },
          timestamp: Date.now(),
        };
      },
      format: ({ data }) =>
        formatXml({
          tag: "tweet-reply",
          params: { tweetId: data.tweetId },
          content: data.content,
        }),
    }),

    "twitter:tweet": output({
      schema: z.object({
        content: z.string().max(280),
      }),
      description: "Use this to post a new tweet",

      handler: async (data, ctx, agent) => {
        const twitter = agent.container.resolve<TwitterClient>("twitter");
        await twitter.sendTweet({
          content: data.content,
        });
        return {
          data,
          timestamp: Date.now(),
        };
      },

      format: ({ data }) =>
        formatXml({
          tag: "tweet",
          content: data.content,
        }),
    }),
  },
});

// Start the agent
await agent.start();
