import { LogLevel } from "@daydreamsai/core/src/core/v1/types";
import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import {
  createMemoryStore,
  defaultContext,
} from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { input, output } from "@daydreamsai/core/src/core/v1/utils";
import { z } from "zod";
import { researchDeepActions } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";
import createContainer from "@daydreamsai/core/src/core/v1/container";
import { formatMsg } from "@daydreamsai/core/src/core/v1";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const model = groq("deepseek-r1-distill-llama-70b");
const memory = createMemoryStore();

const container = createContainer()
  .instance("groq", groq)
  .instance("model", model)
  .instance("memory", memory)
  .singleton(tavily, () =>
    tavily({
      apiKey: process.env.TAVILY_API_KEY!,
    })
  );

container.resolve(tavily);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const agent = createDreams({
  logger: LogLevel.INFO,
  memory,
  container,
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
      async subscribe(send, agent) {
        while (true) {
          const question = await rl.question(">");

          send(defaultContext, "main", {
            user: "admin",
            text: question,
          });
        }
      },
    }),
  },
  outputs: {
    message: output({
      description: "",
      schema: z.string(),
      format(content) {
        return formatMsg({
          role: "assistant",
          content,
        });
      },
      handler(content, ctx) {
        console.log("Agent:" + content);
        return {
          data: content,
          timestamp: Date.now(),
        };
      },
    }),
  },
  actions: [...researchDeepActions],
});

await agent.start();

while (true) {}
