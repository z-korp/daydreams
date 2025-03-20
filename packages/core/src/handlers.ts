import type { Logger } from "./logger";
import type { TaskRunner } from "./task";
import { runAction } from "./tasks";
import type {
  ActionCall,
  ActionResult,
  AnyAction,
  AnyAgent,
  AnyContext,
  ContextState,
  Memory,
  Output,
  OutputRef,
  WorkingMemory,
} from "./types";
import { randomUUIDv7 } from "./utils";

class ActionNotFoundError extends Error {
  constructor(public call: ActionCall) {
    super();
  }
}

class ParsingError extends Error {
  constructor(public parsingError: unknown) {
    super();
  }
}

export async function prepareActionCall({
  call,
  actions,
  logger,
}: {
  call: ActionCall;
  actions: AnyAction[];
  logger: Logger;
}) {
  const action = actions.find((a) => a.name === call.name);

  if (!action) {
    logger.error("agent:action", "ACTION_MISMATCH", {
      name: call.name,
      data: call.content,
    });

    throw new ActionNotFoundError(call);
  }

  try {
    const data = action.schema.parse(
      call.content.length > 0 ? JSON.parse(call.content) : {}
    );

    call.data = data;
    return { action, data };
  } catch (error) {
    throw new ParsingError(error);
  }
}

export async function handleActionCall({
  state,
  workingMemory,
  action,
  logger,
  call,
  taskRunner,
  agent,
  agentState,
  abortSignal,
}: {
  state: ContextState<AnyContext>;
  workingMemory: WorkingMemory;
  call: ActionCall;
  action: AnyAction;
  logger: Logger;
  taskRunner: TaskRunner;
  agent: AnyAgent;
  agentState?: ContextState;
  abortSignal?: AbortSignal;
}) {
  let actionMemory: Memory<any> | undefined = undefined;

  if (action.memory) {
    actionMemory =
      (await agent.memory.store.get(action.memory.key)) ??
      action.memory.create();
  }

  const resultData = await taskRunner.enqueueTask(
    runAction,
    {
      action,
      call,
      agent,
      logger,
      ctx: {
        ...state,
        workingMemory,
        actionMemory,
        agentMemory: agentState?.memory,
        abortSignal,
      },
    },
    {
      debug: agent.debugger,
    }
  );

  const result: ActionResult = {
    ref: "action_result",
    id: randomUUIDv7(),
    callId: call.id,
    data: resultData,
    name: call.name,
    timestamp: Date.now(),
    processed: false,
  };

  if (action.format) result.formatted = action.format(result);

  if (action.memory) {
    await agent.memory.store.set(action.memory.key, actionMemory);
  }

  return result;
}

export async function handleOutput({
  outputRef,
  outputs,
  logger,
  state,
  workingMemory,
  agent,
}: {
  outputs: Output[];
  outputRef: OutputRef;
  logger: Logger;
  workingMemory: WorkingMemory;
  state: ContextState;
  agent: AnyAgent;
}) {
  const output = outputs.find((output) => output.type === outputRef.type);

  if (!output) {
    logger.error("agent:output", "OUTPUT_NOT_FOUND", {
      outputRef,
      availableOutputs: outputs.map((o) => o.type),
    });
    return {
      ...outputRef,
      params: { error: "OUTPUT NOT FOUND" },
      timestamp: Date.now(),
      data: { content: outputRef.data, error: "OUTPUT NOT FOUND" },
    };
  }

  logger.debug("agent:output", outputRef.type, outputRef.data);

  try {
    let parsedContent = outputRef.data;
    if (typeof parsedContent === "string") {
      if (output.schema._def.typeName !== "ZodString") {
        try {
          parsedContent = JSON.parse(parsedContent.trim());
        } catch (error) {
          console.log("failed parsing output content", {
            content: parsedContent,
          });
          throw error;
        }
      }
    }
    let data: any;
    try {
      data = output.schema.parse(parsedContent);
    } catch (error) {
      console.log("failed parsing output schema");
      throw error;
    }

    const response = await output.handler(
      data,
      {
        ...state,
        workingMemory,
      },
      agent
    );

    if (Array.isArray(response)) {
      const refs: OutputRef[] = [];
      for (const res of response) {
        const ref: OutputRef = {
          ...outputRef,
          id: randomUUIDv7(),
          ...res,
        };

        ref.formatted = output.format ? output.format(response) : undefined;
        refs.push(ref);
      }
      return refs;
    } else if (response) {
      const ref: OutputRef = {
        ...outputRef,
        ...response,
      };

      ref.formatted = output.format ? output.format(response) : undefined;

      return ref;
    }

    return {
      ...outputRef,
      formatted: output.format ? output.format(data) : undefined,
      data,
    };
  } catch (error) {
    const ref: OutputRef = {
      ...outputRef,
      params: { error: "true" },
      timestamp: Date.now(),
      data: { content: outputRef.data, error },
    };

    logger.error("agent:output", outputRef.type, error);

    return ref;
  }
}
