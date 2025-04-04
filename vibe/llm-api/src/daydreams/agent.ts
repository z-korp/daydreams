import { createDreams, validateEnv, LogLevel } from '@daydreamsai/core';
import { createAnthropic } from "@ai-sdk/anthropic";
import { chatContext } from './context/chat.context';
import { addToChatHistory, clearChatHistory } from './actions/chat.action';
import { apiInput } from './inputs/chat.input';
import { chatOutput } from './outputs/chat.output';
import { z } from "zod";

// Validate environment variables
const env = validateEnv(
  z.object({
    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  })
);

// Initialize AI model provider
const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

// Create and start the Daydreams agent
export const agent = createDreams({
  // Configure logging
  logger: LogLevel.INFO,
  
  // Specify the model to use
  model: anthropic("claude-3-7-sonnet-latest"),
  
  // Add contexts
  context: chatContext,
  
  // Add actions
  actions: [addToChatHistory, clearChatHistory],
  
  // Add inputs
  inputs: {
    chat: apiInput,
  },
  
  // Add outputs
  outputs: {
    "chat:response": chatOutput,
  },
  
  // Optional debugging
  debugger: async (contextId, keys, data) => {
    console.log(`Debug: ${contextId}, ${keys.join(':')}`, data);
  },
}).start();
