import { createGroq } from "@ai-sdk/groq";
import { createDreams, discord } from "@daydreamsai/core/v1";
import { deepResearch } from "./deep-research/research";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [discord, deepResearch],
});

console.log("Starting Daydreams Discord Bot...");
await agent.start();
console.log("Daydreams Discord Bot started");
