import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import { researchDeepActions } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";
import {
  createContainer,
  createDreams,
  createMemoryStore,
  defaultContext,
  formatMsg,
  input,
  LogLevel,
  output,
} from "@daydreamsai/core/v1";

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
      format: ({ user, text }) =>
        formatMsg({
          role: "user",
          user: user,
          content: text,
        }),

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
      handler(content, ctx) {
        console.log("Agent:" + content);
        return {
          data: content,
          timestamp: Date.now(),
        };
      },
      format({ data }) {
        return formatMsg({
          role: "assistant",
          content: data,
        });
      },
    }),
  },
  actions: [...researchDeepActions],
});

await agent.start();
