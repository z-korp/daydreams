import chalk from "chalk";
import { Handler } from "../packages/core/src/core/orchestrator";
import { HandlerRole, LogLevel } from "../packages/core/src/core/types";
import { env } from "../packages/core/src/core/env";
import { TwitterClient } from "../packages/core/src/core/io/twitter";
import { defaultCharacter as character } from "../packages/core/src/core/characters/character";
import {
  MasterProcessor,
  masterProcessorSchema as outputSchema,
} from "../packages/core/src/core/processors/master-processor";
import { ResearchQuantProcessor } from "../packages/core/src/core/processors/research-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { MemoryManagerInterface } from "../packages/core/src/core/new";
import { z } from "zod";
import { createScheduler } from "../packages/core/src/core/schedule-service";
import { MongoDb } from "../packages/core/src/core/db/mongo-db";

// Chain of Thought...

const kvDb = new MongoDb(
  "mongodb://localhost:27017",
  "myApp",
  "scheduled_tasks"
);

await kvDb.connect();
console.log(chalk.green("✅ Scheduled task database connected"));

await kvDb.deleteAll();

const twitter = new TwitterClient({
  username: env.TWITTER_USERNAME,
  password: env.TWITTER_PASSWORD,
  email: env.TWITTER_EMAIL,
});

async function main() {
  const processor = new MasterProcessor(
    new LLMClient({
      model: "anthropic/claude-3-5-sonnet-latest",
    }),
    outputSchema
  );

  processor.registerIOHandler({
    name: "twitter_thought",
    role: HandlerRole.OUTPUT,
    execute: async (data: unknown) => {
      const thoughtData = data as { content: string };

      // Post thought to Twitter
      return twitter.createTweetOutput().handler({
        content: thoughtData.content,
      });
    },
    outputSchema: z
      .object({
        content: z
          .string()
          .regex(/^[\x20-\x7E]*$/, "No emojis or non-ASCII characters allowed"),
      })
      .describe(
        "This is the content of the tweet you are posting. It should be a string of text that is 280 characters or less. Use this to post a tweet on the timeline."
      ),
  });

  processor.addStream({
    name: "twitter_mentions",
    role: HandlerRole.INPUT,
    execute: async () => {
      console.log(chalk.blue("🔍 Checking Twitter mentions..."));
      // Create a static mentions input handler
      const mentionsInput = twitter.createMentionsInput(60000);
      const mentions = await mentionsInput.handler();

      // If no new mentions, return an empty array to skip processing
      if (!mentions || !mentions.length) {
        return [];
      }

      console.log(chalk.green("🔍 Found mentions:", mentions.length));

      // Filter out mentions that do not have the required non-null properties before mapping
      return mentions
        .filter(
          (mention) =>
            mention.metadata.tweetId !== undefined &&
            mention.metadata.conversationId !== undefined &&
            mention.metadata.userId !== undefined
        )
        .map((mention) => ({
          userId: mention.metadata.userId!,
          threadId: mention.metadata.conversationId!,
          contentId: mention.metadata.tweetId!,
          platformId: "twitter",
          data: mention,
        }));
    },
  });

  // scheduler tasks to call the processor
  const scheduler = createScheduler(kvDb, processor);

  await scheduler.scheduleTask("sleever", "twitter_mentions", {}, 10000);

  scheduler.start();
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
