import { createGroq } from "@ai-sdk/groq";
import {
  createContainer,
  createDreams,
  LogLevel,
  createMemoryStore,
  validateEnv,
} from "@daydreamsai/core";
import { cli, createChromaVectorStore } from "@daydreamsai/core/extensions";
import { z } from "zod";

const env = validateEnv(
  z.object({
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  })
);

const groq = createGroq({
  apiKey: env.GROQ_API_KEY!,
});

const agent = createDreams({
  logger: LogLevel.DEBUG,
  container: createContainer(),
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [cli],
  memory: {
    store: createMemoryStore(),
    vector: createChromaVectorStore("agent", "http://localhost:8000"),
  },
});

// Start the agent
await agent.start();
