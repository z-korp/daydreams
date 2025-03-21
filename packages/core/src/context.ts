import { z } from "zod";
import type {
  AnyAgent,
  AnyContext,
  Context,
  ContextState,
  Log,
  WorkingMemory,
} from "./types";
import { formatContextLog } from "./formatters";
import { memory } from "./utils";

/**
 * Creates a context configuration
 * @template Memory - Type of working memory
 * @template Args - Zod schema type for context arguments
 * @template Ctx - Type of context data
 * @template Exports - Type of exported data
 * @param ctx - Context configuration object
 * @returns Typed context configuration
 */

export function context<
  Memory = any,
  Args extends z.ZodTypeAny = z.ZodTypeAny,
  Ctx = any,
>(ctx: Context<Memory, Args, Ctx>): Context<Memory, Args, Ctx> {
  return ctx;
}

/**
 * Retrieves and sorts working memory logs
 * @param memory - Working memory object
 * @param includeThoughts - Whether to include thought logs (default: true)
 * @returns Sorted array of memory logs
 */
export function getWorkingMemoryLogs(
  memory: Partial<WorkingMemory>,
  includeThoughts = true
): Log[] {
  return [
    ...(memory.inputs ?? []),
    ...(memory.outputs ?? []),
    ...(memory.calls ?? []),
    ...((includeThoughts ? memory.thoughts : undefined) ?? []),
    ...(memory.results ?? []),
  ].sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));
}

export function renderWorkingMemory({
  memory,
  processed,
}: {
  memory: Partial<WorkingMemory>;
  processed: boolean;
}) {
  return getWorkingMemoryLogs(memory, false)
    .filter((i) => i.processed === processed)
    .map((i) => formatContextLog(i))
    .flat();
}

/**
 * Creates a default working memory object
 * @returns Empty working memory with initialized arrays
 */
export function createWorkingMemory(): WorkingMemory {
  return {
    inputs: [],
    outputs: [],
    thoughts: [],
    calls: [],
    results: [],
  };
}

/**
 * Default working memory config
 * Provides a memory container with standard working memory structure
 */
export const defaultWorkingMemory = memory<WorkingMemory>({
  key: "working-memory",
  create: createWorkingMemory,
});

/**
 * Default context configuration
 * Provides a basic context with string schema and test property
 */
export const defaultContext = context({
  type: "default",
  schema: z.string(),
  key: (key) => key,
  create(state) {
    return {
      test: true,
    };
  },
});

export function getContextId<TContext extends AnyContext>(
  context: TContext,
  args: z.infer<TContext["schema"]>
) {
  const key = context.key ? context.key(args) : context.type;
  return context.key ? [context.type, key].join(":") : context.type;
}

export async function getContextState<TContext extends AnyContext>(
  agent: AnyAgent,
  context: TContext,
  args: z.infer<TContext["schema"]>
): Promise<ContextState<TContext>> {
  const key = context.key ? context.key(args) : context.type;
  const id = context.key ? [context.type, key].join(":") : context.type;

  const options = context.setup ? await context.setup(args, agent) : {};

  const memory =
    (await agent.memory.store.get(id)) ??
    (context.create
      ? context.create({ key, args, context, id: id, options })
      : {});

  return {
    id,
    key,
    args,
    options,
    context,
    memory,
  };
}

export async function getContextWorkingMemory(
  agent: AnyAgent,
  contextId: string
) {
  return (
    (await agent.memory.store.get<WorkingMemory>(
      [contextId, "working-memory"].join(":")
    )) ?? (await defaultWorkingMemory.create())
  );
}

export async function saveContextWorkingMemory(
  agent: AnyAgent,
  contextId: string,
  workingMemory: WorkingMemory
) {
  return await agent.memory.store.set(
    [contextId, "working-memory"].join(":"),
    workingMemory
  );
}
