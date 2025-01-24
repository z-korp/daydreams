/**
 * Example demonstrating a Twitter bot using the Daydreams package.
 * This bot can:
 * - Monitor Twitter mentions and auto-reply
 * - Generate autonomous thoughts and tweet them
 * - Maintain conversation memory using ChromaDB
 * - Process inputs through a character-based personality
 */

import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { Processor } from "../packages/core/src/core/processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { LogLevel } from "../packages/core/src/core/types";
import chalk from "chalk";
import { defaultCharacter } from "../packages/core/src/core/character";
import { Consciousness } from "../packages/core/src/core/consciousness";
import { z } from "zod";
import readline from "readline";

async function main() {
  const loglevel = LogLevel.INFO;
  // Initialize core dependencies
  const vectorDb = new ChromaVectorDB("twitter_agent", {
    chromaUrl: "http://localhost:8000",
    logLevel: loglevel,
  });

  await vectorDb.purge(); // Clear previous session data

  const roomManager = new RoomManager(vectorDb);

  const llmClient = new LLMClient({
    model: "anthropic/claude-3-5-sonnet-latest", // Using a known supported model
    temperature: 0.3,
  });

  // Initialize processor with default character personality
  const processor = new Processor(
    vectorDb,
    llmClient,
    defaultCharacter,
    loglevel
  );

  // Initialize core system
  const orchestrator = new Orchestrator(roomManager, vectorDb, processor, {
    level: loglevel,
    enableColors: true,
    enableTimestamp: true,
  });

  // Initialize autonomous thought generation
  const consciousness = new Consciousness(llmClient, roomManager, {
    intervalMs: 300000, // Think every 5 minutes
    minConfidence: 0.7,
    logLevel: loglevel,
  });

  orchestrator.registerIOHandler({
    name: "fetchGithubIssues",
    role: HandlerRole.ACTION,
    schema: z.object({
      repo: z.string(),
    }),
    handler: async (payload) => {
      // 1. Fetch some info from GitHub
      // 2. Return the fetched data so it can be processed as "new input"
      //    to the next step in the chain.
      const { repo } = payload as { repo: string };
      const response = await fetch(
        `https://api.github.com/repos/${repo}/issues`
      );
      const issues = await response.json();
      // The data returned here is fed back into the Orchestrator's chain flow.
      return issues;
    },
  });

  orchestrator.registerIOHandler({
    name: "universalApiCall",
    role: HandlerRole.ACTION,
    // The agent must fill out these fields to make a valid request
    schema: z
      .object({
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
        url: z.string().url(),
        headers: z.record(z.string()).optional(),
        body: z.union([z.string(), z.record(z.any())]).optional(),
      })
      .describe(
        "Use this to fetch data from an API. It should include the method, url, headers, and body."
      ),
    handler: async (payload) => {
      const { method, url, headers, body } = payload as {
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: any;
      };

      // Make the HTTP call
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Return JSON or text
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      // Return the result so the agent can process it further
      return {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      };
    },
  });

  orchestrator.registerIOHandler({
    name: "user_chat",
    role: HandlerRole.INPUT,
    // This schema describes what a user message looks like
    schema: z.object({
      content: z.string(),
      userId: z.string().optional(),
    }),
    // For "on-demand" input handlers, the `handler()` can be a no-op.
    // We'll call it manually with data, so we don't need an interval.
    handler: async (payload) => {
      // We simply return the payload so the Orchestrator can process it
      return payload;
    },
  });

  orchestrator.registerIOHandler({
    name: "ui_chat_reply",
    role: HandlerRole.OUTPUT,
    schema: z.object({
      userId: z.string().optional(),
      message: z.string(),
    }),
    handler: async (payload) => {
      const { userId, message } = payload as {
        userId?: string;
        message: string;
      };

      // In a real app, you might push this to a WebSocket, or store it in a DB,
      // or just log it to the console:
      console.log(`Reply to user ${userId ?? "??"}: ${message}`);

      // No need to return anything if it's a final "output"
    },
  });

  // Set up readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Function to prompt for user input
  const promptUser = () => {
    rl.question(
      'Enter your message (or "exit" to quit): ',
      async (userMessage) => {
        if (userMessage.toLowerCase() === "exit") {
          rl.close();
          process.exit(0);
        }

        // Dispatch the message
        const userId = "console-user";
        const outputs: any = await orchestrator.dispatchToInput("user_chat", {
          content: userMessage,
          userId,
        });

        // Now `outputs` is an array of suggestions with role=output that got triggered
        if (outputs && outputs.length > 0) {
          for (const out of outputs) {
            if (out.name === "ui_chat_reply") {
              // Our "ui_chat_reply" handler data has { userId, message }
              console.log(chalk.green(`AI says: ${out.data.message}`));
            }
          }
        }

        // Continue prompting
        promptUser();
      }
    );
  };

  // Start the prompt loop
  console.log(chalk.cyan("🤖 Bot is now running and monitoring Twitter..."));
  console.log(chalk.cyan("You can type messages in the console."));
  console.log(chalk.cyan('Type "exit" to quit'));
  promptUser();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log(chalk.yellow("\n\nShutting down..."));

    // Clean up resources
    await consciousness.stop();
    orchestrator.removeIOHandler("twitter_mentions");
    orchestrator.removeIOHandler("consciousness_thoughts");
    orchestrator.removeIOHandler("twitter_reply");
    orchestrator.removeIOHandler("twitter_thought");
    rl.close();

    console.log(chalk.green("✅ Shutdown complete"));
    process.exit(0);
  });
}

// Run the example
main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
