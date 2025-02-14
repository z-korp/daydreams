/**
 * Basic example demonstrating a simple chat interface using Dreams
 * with a command line interface and Groq's LLM.
 */
import { createGroq } from "@ai-sdk/groq";
import { createDreams, cli } from "@daydreamsai/core/v1";

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

// Create Dreams agent instance
const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [cli],
}).start();
