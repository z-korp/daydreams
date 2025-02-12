import {
  LogLevel,
  type Action,
  type ActionCall,
  type Agent,
  type AgentContext,
  type AnyAgent,
  type AnyContext,
  type Config,
  type Debugger,
  type InferMemoryData,
  type Log,
  type Output,
  type Subscription,
  type WorkingMemory,
} from "./types";
import {
  createContextHandler,
  defaultContext,
  defaultContextMemory,
  defaultContextRender,
} from "./memory";
import { Logger } from "./logger";
import {
  formatAction,
  formatContext,
  formatContextLog,
  formatOutputInterface,
} from "./formatters";
import { generateText, type LanguageModelV1 } from "ai";
import { randomUUID } from "crypto";
import { createParser, createPrompt } from "./prompt";
import createContainer from "./container";
import { createServiceManager } from "./serviceProvider";
import {
  type Context,
  type InferContextCtx,
  type InferContextMemory,
} from "./types";
import type { z } from "zod";
import { task, type TaskContext } from "./task";

const promptTemplate = `
You are tasked with analyzing messages, formulating responses, and initiating actions based on a given context. 
You will be provided with a set of available actions, outputs, and a current context. 
Your instructions is to analyze the situation and respond appropriately.

## Instructions
- If asked for something - never do a summary unless you are asked to do a summary. Always respond with the exact information requested.
- You must use the available actions and outputs to respond to the context.
- You must reason about the context, think, and planned actions.

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

Here's how you structure your response:
<response>
<reasoning>
[Your reasoning of the context, think, messages, and planned actions]
</reasoning>
[List of async actions to be initiated, if applicable]
<action name="[Action name]">[action arguments using the schema as JSON]</action>
[List of outputs, if applicable]
<output type="[Output type]">
[output data using the schema]
</output>
</response>

{{examples}}
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
    updates: updates.map(formatContextLog),
    examples: [],
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

const runGenerate = task(
  "agent:run:generate",
  async <TContext extends Context<WorkingMemory, any, any, any>>(
    {
      context,
      contextId,
      key,
      args,
      memory,
      outputs,
      actions,
      ctx,
      logger,
      model,
    }: {
      context: TContext;
      args: z.infer<TContext["schema"]>;
      contextId: string;
      key: string;
      memory: WorkingMemory;
      outputs: Output[];
      actions: Action[];
      ctx: InferContextCtx<TContext>;
      logger: Logger;
      model: LanguageModelV1;
    },
    { callId, debug }: TaskContext
  ) => {
    const newInputs = memory.inputs.filter((i) => i.processed !== true);

    debug(contextId, ["memory", callId], JSON.stringify(memory, null, 2));

    const system = prompt({
      context: formatContext({
        type: context.type ?? "system",
        key: key,
        description: context.description,
        instructions:
          typeof context.instructions === "function"
            ? context.instructions({ key, args }, ctx)
            : context.instructions,
        content: context.render
          ? context.render(memory, ctx)
          : defaultContextRender(memory),
      }),

      outputs: outputs,
      actions: actions.filter((action) =>
        action.enabled ? action.enabled(ctx as any) : true
      ),
      updates: [
        ...newInputs,
        ...memory.results.filter((i) => i.processed !== true),
      ],
    });

    debug(contextId, ["prompt", callId], system);

    logger.debug("agent:system", system);

    const result = await generateText({
      model,
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

    debug(contextId, ["response", callId], text);

    logger.debug("agent:response", text);

    return parse(text);
  },
  {}
);

const runAction = task(
  "agent:run:action",
  async <TContext extends AnyContext>({
    context,
    action,
    call,
    agent,
    logger,
  }: {
    context: AgentContext<InferContextMemory<TContext>, TContext> & {
      data: unknown;
    };
    action: Action;
    call: ActionCall;
    agent: AnyAgent;
    logger: Logger;
  }) => {
    try {
      const result = await action.handler(call, context, agent);
      return result;
    } catch (error) {
      logger.error("agent:action", "ACTION_FAILED", { error });
      throw error;
    }
  }
);

export function createDreams<
  Memory extends WorkingMemory = WorkingMemory,
  TContext extends AnyContext = AnyContext,
>(config: Config<Memory, TContext>): Agent<Memory, TContext> {
  const inputSubscriptions = new Map<string, Subscription>();

  const logger = new Logger({
    level: config.logger ?? LogLevel.INFO,
    enableTimestamp: true,
    enableColors: true,
  });

  const contexts = new Map<string, { ctx: any }>();

  const {
    inputs = {},
    outputs = {},
    events = {},
    actions = [],
    experts = {},
    services = [],
    memory,
    model,
    reasoningModel,
  } = config;

  const container = config.container ?? createContainer();

  const contextsRunning = new Set<string>();

  const debug: Debugger = (...args) => {
    if (!config.debugger) return;
    try {
      config.debugger(...args);
    } catch {}
  };

  let booted = false;

  const serviceManager = createServiceManager(container);

  for (const service of services) {
    serviceManager.register(service);
  }

  async function getContext<
    TContext extends Context<WorkingMemory, any, any, any>,
  >(contextHandler: TContext, args: z.infer<TContext["schema"]>) {
    const key = contextHandler.key(args);
    const contextId = [contextHandler.type, key].join(":");

    const ctx = contexts.has(contextId)
      ? contexts.get(contextId)
      : contextHandler.setup
        ? await contextHandler.setup(args, agent)
        : {};

    const memory =
      (await agent.memory.get(contextId)) ??
      (contextHandler.create
        ? contextHandler.create({ key, args }, ctx)
        : defaultContextMemory());

    return {
      id: contextId,
      key,
      ctx,
      memory: memory as InferContextMemory<TContext>,
    };
  }

  const agent: Agent<Memory, TContext> = {
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
    context: config.context ?? (defaultContext as TContext),
    emit: (event: string, data: any) => {
      logger.info("agent:event", event, data);
    },

    async start() {
      if (booted) return;

      booted = true;

      await serviceManager.bootAll();

      for (const input of Object.values(inputs)) {
        if (input.install) await input.install(agent);
      }

      for (const [key, input] of Object.entries(agent.inputs)) {
        if (input.subscribe) {
          const subscription = await Promise.resolve(
            input.subscribe((contextHandler, args, data) => {
              logger.info("agent", "input", { contextHandler, args, data });
              agent
                .send(contextHandler, args, { type: key, data })
                .catch((err) => {
                  console.error(err);
                  // logger.error("agent", "input", err);
                });
            }, agent)
          );

          if (subscription) inputSubscriptions.set(key, subscription);
        }
      }

      for (const output of Object.values(outputs)) {
        if (output.install) await output.install(agent);
      }

      for (const action of actions) {
        if (action.install) await action.install(agent);
      }
    },

    async stop() {},

    run: async (contextHandler, args) => {
      if (!booted) await agent.start();

      const {
        key,
        id: contextId,
        ctx,
        memory,
      } = await getContext(contextHandler, args);

      if (contextsRunning.has(contextId)) return;
      contextsRunning.add(contextId);

      const outputsEntries = Object.entries(agent.outputs)
        .filter(([_, output]) =>
          output.enabled ? output.enabled(ctx as any) : true
        )
        .map(([type, output]) => ({
          type,
          ...output,
        }));

      // const { memory } = ctx;

      const maxSteps = 5;
      let step = 1;

      while (true) {
        const _actions = await Promise.all(
          actions.map(async (action) => {
            let actionMemory: unknown = {};

            if (action.memory) {
              actionMemory =
                (await agent.memory.get(action.memory.key)) ??
                action.memory.create();
            }

            console.log({ actionMemory });

            const enabled = action.enabled
              ? action.enabled({
                  ...ctx,
                  data: actionMemory,
                })
              : true;

            return enabled ? action : undefined;
          })
        ).then((r) => r.filter((a) => !!a));

        const data = await runGenerate({
          context: contextHandler,
          args,
          contextId,
          ctx,
          key,
          logger,
          memory,
          model: config.reasoningModel ?? config.model,
          outputs: outputsEntries,
          actions: _actions,
        });

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
          const output = outputs[type];

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
              ctx,
              agent
            );
          } catch (error) {
            logger.error("agent:output", type, error);
          }
        }

        await Promise.allSettled(
          data.actions.map(async ({ name, data }) => {
            const action = actions.find((a) => a.name === name);

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

              let actionMemory: unknown = {};

              if (action.memory) {
                actionMemory =
                  (await agent.memory.get(action.memory.key)) ??
                  action.memory.create();

                console.log({ actionMemory });
              }

              const result = await runAction({
                action,
                call,
                context: {
                  id: contextId,
                  context: contextHandler,
                  ctx,
                  args,
                  memory,
                  data: actionMemory,
                },
                agent,
                logger,
              });

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

      await agent.memory.set(contextId, memory);

      contextsRunning.delete(contextId);
    },

    send: async (contextHandler, args, input: { type: string; data: any }) => {
      if (input.type in agent.inputs === false) return;

      const {
        key,
        id: contextId,
        ctx,
        memory,
      } = await getContext(contextHandler, contextHandler.schema.parse(args));

      const processor = agent.inputs[input.type];

      const data = processor.schema.parse(input.data);

      const shouldContinue = await processor.handler(
        data,
        {
          type: contextHandler.type,
          key,
          memory,
          ctx,
        } as any,
        agent
      );

      await agent.evaluator({
        type: contextHandler.type,
        key,
        memory,
        ctx,
      } as any);

      await agent.memory.set(contextId, memory);

      if (shouldContinue) await agent.run(contextHandler, args);
    },

    evaluator: async (ctx) => {
      const { id, memory } = ctx;
      logger.debug("agent:evaluator", "memory", memory);
    },
  };

  return agent;
}
