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
} from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { action, input, output } from "@daydreamsai/core/src/core/v1/utils";
import { z } from "zod";
import { Research, researchDeepActions } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";
import { formatXml } from "@daydreamsai/core/src/core/v1/xml";
import createContainer from "@daydreamsai/core/src/core/v1/container";
import { service } from "@daydreamsai/core/src/core/v1/serviceProvider";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const model = groq("deepseek-r1-distill-llama-70b");
const memory = createMemoryStore();

const container = createContainer()
  .instance("groq", groq)
  .instance("model", model)
  .instance("memory", memory)
  .singleton("tavily", () =>
    tavily({
      apiKey: process.env.TAVILY_API_KEY!,
    })
  );

const myProvider = service({
  register(container) {
    console.log("registering my service");
  },
  async boot(container) {
    console.log("booting my service");
  },
});

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
  services: [myProvider],
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
      schema: z.object({
        content: z.string(),
      }),
      async install(agent) {
        console.log("instaling output");
      },
      handler(params, ctx) {
        console.log("Agent:" + params.content);
        return true;
      },
    }),
  },
  events: {},
  experts: {},
  actions: [...researchDeepActions],
});

await agent.start();

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
