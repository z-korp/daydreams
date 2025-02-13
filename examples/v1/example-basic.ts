/**
 * Basic example demonstrating a simple chat interface using Dreams
 * with a command line interface and Groq's LLM.
 */

import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import { context, input, output } from "@daydreamsai/core/src/core/v1/utils";
import { createMemoryStore } from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { LogLevel, WorkingMemory } from "@daydreamsai/core/src/core/v1/types";
import { z } from "zod";
import * as readline from "readline/promises";
import { formatMsg } from "@daydreamsai/core/src/core/v1";

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Setup readline interface for CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Define chat context for managing user sessions
// This defines a 'memory' location for the user's chat history
// The key is a compound key that includes the user's name
// This allows the agent to manage multiple conversations with different users, and different combinations of memory key
const chatContext = context({
  type: "user:chat",
  key: ({ user }) => user.toString(),
  schema: z.object({ user: z.string() }),
  async setup() {
    return {};
  },
});

// Create Dreams agent instance
const agent = createDreams<WorkingMemory>({
  logger: LogLevel.DEBUG,
  memory: createMemoryStore(),
  model: groq("deepseek-r1-distill-llama-70b"),
  inputs: {
    // Handle incoming messages
    message: input({
      schema: z.object({
        user: z.string(),
        text: z.string(),
      }),
      format: ({ user, text }) =>
        formatMsg({
          role: "user",
          content: text,
          user,
        }),
      // Subscribe to CLI input
      async subscribe(send) {
        while (true) {
          const question = await rl.question("> ");
          console.log("Sending message:", question);

          send(
            chatContext,
            { user: "admin" },
            {
              user: "admin",
              text: question,
            }
          );
        }
      },
    }),
  },

  outputs: {
    // Handle outgoing messages
    message: output({
      description: "Send messages to the user",
      schema: z.object({
        message: z.string().describe("The message to send"),
      }),
      handler(content) {
        console.log("Agent:", content.message);
        return {
          data: content,
          timestamp: Date.now(),
        };
      },
      format: ({ data }) =>
        formatMsg({
          role: "assistant",
          content: data.message,
        }),
    }),
  },
});

// Start the agent
await agent.start();
