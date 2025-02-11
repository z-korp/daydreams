import {
  InferMemoryFromHandler,
  LogLevel,
} from "@daydreamsai/core/src/core/v1/types";
import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import {
  createContextHandler,
  createMemoryStore,
  defaultContext,
  defaultContextRender,
  // getContextMemoryHandler,
} from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { action, input, output } from "@daydreamsai/core/src/core/v1/utils";
import { z } from "zod";
import { Research, researchDeepActions, startDeepResearch } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";
import { formatXml } from "@daydreamsai/core/src/core/v1/xml";
import { researchSchema } from "./schemas";
import createContainer from "@daydreamsai/core/src/core/v1/container";

const container = createContainer();

container.singleton(tavily, () =>
  tavily({
    apiKey: process.env.TAVILY_API_KEY!,
  })
);

console.log(container.resolve(tavily));

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const memory = createMemoryStore();

const model = groq("deepseek-r1-distill-llama-70b");

const contextHandler = createContextHandler(
  () => ({
    ...defaultContext(),
    researches: [] as Research[],
  }),
  (memory) => {
    return [
      ...defaultContextRender(memory),
      ...memory.researches.map((r) =>
        formatXml({
          tag: "research",
          params: { id: r.id },
          content: JSON.stringify(r),
        })
      ),
    ];
  }
);

type Handler = typeof contextHandler;
type Memory = InferMemoryFromHandler<Handler>;

const agent = createDreams<Memory, Handler>({
  logger: LogLevel.INFO,
  memory,
  container,
  context: contextHandler,
  debugger: async (contextId, keys, data) => {
    const [type, id] = keys;
    await Bun.write(`./logs/${contextId}/${id}-${type}.md`, data);
  },
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
  actions: [...researchDeepActions],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const input = await rl.question(">");

  const contextId = "my-research-" + Date.now();

  await agent.send(contextId, {
    type: "message",
    data: {
      user: "Galego",
      text: input,
    },
  });
}
