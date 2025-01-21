import { Core } from "../packages/core/src/core/core";
import { tweetSchema, TwitterClient } from "../packages/core/src/io/twitter";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { Processor } from "../packages/core/src/core/processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { env } from "../packages/core/src/core/env";
import { LogLevel } from "../packages/core/src/types";
import chalk from "chalk";
import { defaultCharacter } from "../packages/core/src/core/character";
import { JSONSchemaType } from "ajv";
import { Consciousness } from "../packages/core/src/core/consciousness";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";

async function main() {
  // Initialize core dependencies
  const vectorDb = new ChromaVectorDB("twitter_agent", {
    chromaUrl: "http://localhost:8000",
    logLevel: LogLevel.ERROR,
  });

  const roomManager = new RoomManager(vectorDb);

  const llmClient = new LLMClient({
    provider: "anthropic",
    apiKey: env.ANTHROPIC_API_KEY,
  });

  // Initialize processor with character definition
  const processor = new Processor(
    vectorDb,
    llmClient,
    defaultCharacter,
    LogLevel.DEBUG
  );

  // Initialize core
  const core = new Core(roomManager, vectorDb, processor, {
    logging: {
      level: LogLevel.ERROR,
      enableColors: true,
      enableTimestamp: true,
    },
  });

  // Initialize Twitter client
  const twitter = new TwitterClient(
    {
      username: env.TWITTER_USERNAME,
      password: env.TWITTER_PASSWORD,
      email: env.TWITTER_EMAIL,
    },
    LogLevel.DEBUG
  );

  // Initialize consciousness
  const consciousness = new Consciousness(llmClient, roomManager, {
    intervalMs: 300000, // Think every 5 minutes
    minConfidence: 0.7,
    logLevel: LogLevel.ERROR,
  });

  // Initialize ChainOfThought for goal management
  const dreams = new ChainOfThought(llmClient, {
    worldState: {
      role: "Twitter Bot",
      capabilities: [
        "Monitor Twitter mentions",
        "Generate thoughtful replies",
        "Post original thoughts",
      ],
    },
  });

  // Register actions for Twitter interactions
  //dreams.registerAction(
  //  "POST_TWEET",
  //  async (payload: { content: string }) => {
  //    return twitter.createTweetOutput().handler({ content: payload.content });
  //  },
  //  {
  //    description: "Post a new tweet",
  //    example: JSON.stringify({ content: "Hello, world!" }),
  //  }
  //);

  //dreams.registerAction(
  //  "REPLY_TO_TWEET",
  //  async (payload: { content: string; inReplyTo: string }) => {
  //    return twitter.createTweetOutput().handler(payload);
  //  },
  //  {
  //    description: "Reply to a specific tweet",
  //    example: JSON.stringify({ 
  //        content: "Thanks for reaching out!",
  //        inReplyTo: "123456789"
  //      }),
  //  }
  //);

  // Add goal-related event handlers
  dreams.on("goal:created", ({ id, description }) => {
    console.log(chalk.cyan("\n🎯 New goal created:"), { id, description });
  });

  dreams.on("goal:updated", ({ id, status }) => {
    console.log(chalk.yellow("\n📝 Goal status updated:"), { id, status });
  });

  dreams.on("goal:completed", ({ id, result }) => {
    console.log(chalk.green("\n✨ Goal completed:"), { id, result });
  });

  dreams.on("goal:failed", ({ id, error }) => {
    console.log(chalk.red("\n💥 Goal failed:"), {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  // Modify Twitter mentions handler to use goals
  core.registerInput({
    name: "twitter_mentions",
    handler: async () => {
      console.log(chalk.blue("🔍 Checking Twitter mentions..."));
      const mentions = await twitter.createMentionsInput(60000).handler();
      
      // Create a goal for each mention
      mentions.forEach(mention => {
        dreams.goalManager.addGoal({
          description: `Reply to tweet: ${mention.id}`,
          horizon: "short",
          priority: 2,
          dependencies: [],
          metadata: { tweetId: mention.id, content: mention.content }
        });
      });

      return mentions;
    },
    response: {
      type: "string",
      content: "string",
      metadata: "object",
    },
    interval: 60000,
  });

  // Modify consciousness input to use goals
  core.registerInput({
    name: "consciousness_thoughts",
    handler: async () => {
      console.log(chalk.blue("🧠 Generating thoughts..."));
      const thought = await consciousness.start();
      
      dreams.goalManager.addGoal({
        description: "Share original thought",
        horizon: "medium",
        priority: 1,
        dependencies: [],
        metadata: { content: thought.content }
      });

      return thought;
    },
    response: {
      type: "string",
      content: "string",
      metadata: "object",
    },
    interval: 300000, // Check for new thoughts every 5 minutes
  });

  // Execute goals periodically
  setInterval(async () => {
    const readyGoals = dreams.goalManager.getReadyGoals();
    if (readyGoals.length > 0) {
      try {
        await dreams.executeNextGoal();
      } catch (error) {
        console.error(chalk.red("Error executing goal:"), error);
      }
    }
  }, 30000); // Check every 30 seconds

  // Keep the process running
  console.log(chalk.cyan("🤖 Bot is now running and monitoring Twitter..."));
  console.log(chalk.cyan("Press Ctrl+C to stop"));

  // Handle shutdown gracefully
  process.on("SIGINT", async () => {
    console.log(chalk.yellow("\n\nShutting down..."));

    // Stop consciousness
    await consciousness.stop();

    // Remove all inputs and outputs
    core.removeInput("twitter_mentions");
    core.removeInput("consciousness_thoughts");
    core.removeOutput("twitter_reply");
    core.removeOutput("twitter_thought");

    console.log(chalk.green("✅ Shutdown complete"));
    process.exit(0);
  });
}

// Run the example
main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
