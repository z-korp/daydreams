import type {
  Action,
  ActionCall,
  Agent,
  Config,
  ContextHandler,
  Debugger,
  InferContextFromHandler,
  Log,
  Output,
  Subscription,
  WorkingMemory,
} from "./types";
import {
  createContextHandler,
  defaultContext,
  defaultContextRender,
} from "./memory";
import { Logger } from "./logger";
import { render } from "./utils";
import {
  formatAction,
  formatContext,
  formatOutputInterface,
} from "./formatters";
import { createTagParser } from "./xml";
import { generateText } from "ai";
import { randomUUID } from "crypto";
import { createParser, createPrompt } from "./prompt";
import createContainer from "./container";

const promptTemplate = `
You are tasked with analyzing messages, formulating responses, and initiating actions based on a given context. 
You will be provided with a set of available actions, outputs, and a current context. 
Your instructions is to analyze the situation and respond appropriately.

Here are the available actions you can initiate:
<available_actions>
{{actions}}
</available_actions>

Here are the available outputs you can use:
<outputs>
{{outputs}}
</outputs>

Here is the current context:
<context>
{{context}}
</context>

Now, analyze the following new context:
<context>
{{updates}}
</context>

Here's an example of how to structure your response:

<response>
<reasoning>
[Your reasoning of the context, think, messages, and planned actions]
</reasoning>
[List of async actions to be initiated, if applicable]
<action name="[Action name]">[action arguments using the schema as JSON]</action>
[List of outputs, if applicable]
<output type="[Output type]">
[output arguments using the schema as JSON]
</output>
</response>
`;

type AnyAction = Action<any, any, any>;

const prompt = createPrompt(
  promptTemplate,
  ({
    outputs,
    actions,
    updates,
    context,
  }: {
    context: string | string[];
    outputs: Output[];
    updates: Log[];
    actions: AnyAction[];
  }) => ({
    context: context,
    outputs: outputs.map(formatOutputInterface),
    actions: actions.map(formatAction),
    updates: updates.map(formatContext),
  })
);

const parse = createParser<
  {
    think: string[];
    response: string | undefined;
    reasonings: string[];
    actions: { name: string; data: any }[];
    outputs: { type: string; content: string }[];
  },
  {
    action: { name: string };
    output: { type: string };
  }
>(
  () => ({
    think: [],
    reasonings: [],
    actions: [],
    outputs: [],
    response: undefined,
  }),
  {
    response: (state, element, parse) => {
      state.response = element.content;
      return parse();
    },

    action: (state, element) => {
      state.actions.push({
        name: element.attributes.name,
        data: JSON.parse(element.content),
      });
    },

    think: (state, element) => {
      state.think.push(element.content);
    },

    reasoning: (state, element) => {
      state.reasonings.push(element.content);
    },

    output: (state, element) => {
      state.outputs.push({
        type: element.attributes.type,
        content: element.content,
      });
    },
  }
);

const defaultContextHandler: ContextHandler = createContextHandler(
  defaultContext,
  defaultContextRender
);

export function createDreams<
  Memory extends WorkingMemory = WorkingMemory,
  Handler extends ContextHandler<Memory> = ContextHandler<Memory>,
>(config: Config<Memory, Handler>): Agent<Memory, Handler> {
  const inputSubscriptions = new Map<string, Subscription>();

  const logger = new Logger({
    level: config.logger,
    enableTimestamp: true,
    enableColors: true,
  });

  const {
    inputs,
    outputs,
    events,
    actions,
    experts,
    memory,
    model,
    reasoningModel,
  } = config;

  const contextHandler =
    config.context ?? (defaultContextHandler as unknown as Handler);

  const container = config.container ?? createContainer();

  const contextsRunning = new Set<string>();

  const debug: Debugger = (...args) => {
    if (!config.debugger) return;
    try {
      config.debugger(...args);
    } catch {}
  };

  const agent: Agent<Memory, Handler> = {
    inputs,
    outputs,
    events,
    actions,
    experts,
    memory,
    container,
    model,
    reasoningModel,
    debugger: debug,
    context: contextHandler,
    emit: (event: string, data: any) => {
      logger.info("agent:event", event, data);
    },

    run: async (contextId: string) => {
      if (contextsRunning.has(contextId)) return;
      contextsRunning.add(contextId);

      const context = contextHandler(agent.memory);

      const outputs = Object.entries(agent.outputs).map(([type, output]) => ({
        type,
        ...output,
      }));

      const ctx = await context.get(contextId);

      const { memory } = ctx;

      const maxSteps = 5;
      let step = 1;

      const newInputs = memory.inputs.filter((i) => i.processed !== true);

      while (true) {
        const id = Date.now().toString();

        debug(contextId, ["memory", id], JSON.stringify(ctx.memory, null, 2));

        const system = prompt({
          context: context.render(ctx.memory),
          outputs: outputs,
          actions: actions.filter((action) =>
            action.enabled ? action.enabled(ctx as any) : true
          ),
          updates: [
            ...newInputs,
            ...memory.results.filter((i) => i.processed !== true),
          ],
        });

        debug(contextId, ["prompt", id], system);

        logger.debug("agent:system", system);

        const result = await generateText({
          model: config.reasoningModel ?? config.model,
          system,
          messages: [
            {
              role: "assistant",
              content: "<think>",
            },
          ],
          stopSequences: ["</response>"],
        });

        const text = "<think>" + result.text + "</response>";

        debug(contextId, ["response", id], text);

        logger.debug("agent:response", text);

        const data = parse(text);

        logger.debug("agent:parsed", "data", data);

        memory.inputs.forEach((i) => {
          i.processed = true;
        });

        memory.results.forEach((i) => {
          i.processed = true;
        });

        for (const content of data.think) {
          logger.debug("agent:think", content);
        }

        for (const content of data.reasonings) {
          logger.debug("agent:reasoning", content);
        }

        for (const { type, content } of data.outputs) {
          const output = config.outputs[type];

          logger.info("agent:output", type, content);
          try {
            let parsedContent = content;
            if (typeof content === "string") {
              try {
                parsedContent = JSON.parse(content);
              } catch {
                parsedContent = content;
              }
            }

            await output.handler(
              output.schema.parse(parsedContent),
              ctx as InferContextFromHandler<Handler>
            );
          } catch (error) {
            logger.error("agent:output", type, error);
          }
        }

        await Promise.allSettled(
          data.actions.map(async ({ name, data }) => {
            const action = config.actions.find((a) => a.name === name);

            if (!action) {
              logger.error("agent:action", "ACTION_MISMATCH", {
                name,
                data,
              });
              return Promise.reject(new Error("ACTION MISMATCH"));
            }

            try {
              const call: ActionCall = {
                ref: "action_call",
                id: randomUUID(),
                data: action.schema.parse(data),
                name: name,
                timestamp: Date.now(),
              };

              memory.calls.push(call);
              const result = await action.handler(
                call,
                ctx as InferContextFromHandler<Handler>,
                agent
              );

              memory.results.push({
                ref: "action_result",
                callId: call.id,
                data: result,
                name: call.name,
                timestamp: Date.now(),
                processed: false,
              });
            } catch (error) {
              logger.error("agent:action", "ACTION_FAILED", { error });
              throw error;
            }
          })
        );

        break;
      }

      await context.save(contextId, memory);

      contextsRunning.delete(contextId);
    },

    send: async (
      conversationId: string,
      input: { type: string; data: any }
    ) => {
      if (input.type in agent.inputs === false) return;
      const context = contextHandler(agent.memory);

      const { memory } = await context.get(conversationId);

      const processor = agent.inputs[input.type];

      const data = processor.schema.parse(input.data);

      const shouldContinue = await processor.handler(data, {
        id: conversationId,
        memory,
      } as any);

      await agent.evaluator({
        id: conversationId,
        memory,
      } as any);

      await agent.memory.set(conversationId, memory);

      if (shouldContinue) await agent.run(conversationId);
    },

    evaluator: async (ctx) => {
      const { id, memory } = ctx;
      logger.debug("agent:evaluator", "memory", memory);
    },
  };

  for (const [key, input] of Object.entries(agent.inputs)) {
    if (input.subscribe) {
      const subscription = input.subscribe((conversationId, data) => {
        logger.info("agent", "input", { conversationId, data });
        agent.send(conversationId, { type: key, data }).catch((err) => {
          console.error(err);
          // logger.error("agent", "input", err);
        });
      });

      inputSubscriptions.set(key, subscription);
    }
  }

  return agent;
}
