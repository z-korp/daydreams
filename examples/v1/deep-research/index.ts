import { LogLevel } from "@daydreamsai/core/src/core/v1/types";
import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import {
  createContextHandler,
  createMemoryStore,
  defaultContext,
  // getContextMemoryHandler,
} from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { action, input, output } from "@daydreamsai/core/src/core/v1/utils";
import { z } from "zod";
import { researchSchema, startDeepResearch } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

type Research = {
  id: string;
  name: string;
  queries: {
    query: string;
    goal: string;
    results?: any[];
    learnings?: any[];
  }[];
  questions: string[];
  learnings: string[];
  status: "in_progress" | "done";
};

const memory = createMemoryStore();

const contextHandler = createContextHandler(() => ({
  ...defaultContext(),
  research: [] as Research[],
}));

type Handler = typeof contextHandler;

const model = groq("deepseek-r1-distill-llama-70b");

const agent = createDreams<Handler>({
  logger: LogLevel.DEBUG,
  memory,
  context: contextHandler,
  model,
  inputs: {
    message: input({
      schema: z.object({
        user: z.string(),
        text: z.string(),
      }),
      handler(params, ctx) {
        console.log("User:" + params.text);
        ctx.memory.inputs.push({
          ref: "input",
          type: "message",
          params: { user: params.user },
          data: params.text,
          timestamp: Date.now(),
          processed: false,
        });
        return true;
      },
    }),
  },
  outputs: {
    message: output({
      description: "",
      schema: z.string(),
      handler(params, ctx) {
        console.log("Agent:" + params);
        return true;
      },
    }),
  },
  events: {},
  experts: {},
  actions: [
    action({
      name: "start-deep-research",
      schema: researchSchema,
      async handler(params, ctx) {
        const research: Research = {
          ...params,
          learnings: [],
          status: "in_progress",
        };

        console.log({ research });

        ctx.memory.research.push(research);

        startDeepResearch({
          model,
          research,
          tavilyClient,
        }).catch((err) => console.error(err));

        return "Research created!";
      },
    }),
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const input = await rl.question(">");

  const contextId = "my-research";

  await agent.send(contextId, {
    type: "message",
    data: {
      user: "Galego",
      text: input,
    },
  });
}
