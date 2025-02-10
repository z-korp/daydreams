import { type LanguageModelV1 } from "ai";
import type { T } from "vitest/dist/chunks/environment.LoooBwUu.js";
import { z } from "zod";

export type Task = {
  text: string;
  complete: boolean;
};

export type Chain = {
  id: string;
  thinking: string;
  purpose: string;
  experts: { name: string; data: string }[];
};

export interface MemoryStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface WorkingMemory {
  inputs: InputRef[];
  outputs: OutputRef[];
  thoughts: Thought[];
  calls: ActionCall[];
  results: ActionResult[];
  // chains: Chain[];
}

export type Action<
  Schema extends z.AnyZodObject = z.AnyZodObject,
  Result = any,
  Context = any,
> = {
  name: string;
  description?: string;
  schema: Schema;
  enabled?: (ctx: Context) => boolean;
  handler: (call: ActionCall<z.infer<Schema>>, ctx: Context) => Promise<Result>;
};

export type OutputSchema = z.AnyZodObject | z.ZodString;

export type Output<
  Schema extends OutputSchema = OutputSchema,
  Context = any,
> = {
  type: string;
  description: string;
  schema: Schema;
  handler: (
    params: z.infer<Schema>,
    ctx: Context
  ) => Promise<boolean> | boolean;
};

export type Input<
  Schema extends z.AnyZodObject = z.AnyZodObject,
  Context = any,
> = {
  type: string;
  description?: string;
  schema: Schema;
  handler: (
    params: z.infer<Schema>,
    ctx: Context
  ) => Promise<boolean> | boolean;
  subscribe?: (
    send: (conversationId: string, data: z.infer<Schema>) => void
  ) => () => void;
};

export type InputRef = {
  ref: "input";
  type: string;
  data: any;
  params?: Record<string, string>;
  timestamp: number;
  processed?: boolean;
};

export type OutputRef = {
  ref: "output";
  type: string;
  data: any;
  params?: Record<string, string>;
  timestamp: number;
};

export type ActionCall<Data = any> = {
  ref: "action_call";
  id: string;
  name: string;
  data: Data;
  timestamp: number;
};

export type ActionResult<Data = any> = {
  ref: "action_result";
  callId: string;
  name: string;
  data: Data;
  timestamp: number;
  processed?: boolean;
};

export type Thought = {
  ref: "thought";
  content: string;
  timestamp: number;
};

export type Log = InputRef | OutputRef | Thought | ActionCall | ActionResult;

export type COTProps = {
  model: LanguageModelV1;
  plan: string;
  inputs: InputRef[];
  actions: Action[];
  outputs: Output[];
  logs: Log[];
};

export type COTResponse = {
  plan: string[];
  actions: ActionCall[];
  outputs: OutputRef[];
  thinking: Thought[];
};

export type XMLElement = {
  tag: string;
  params?: Record<string, string>;
  content: string | (XMLElement | string)[];
};

export type Pretty<type> = { [key in keyof type]: type[key] } & unknown;

export type ExtractTemplateVariables<T extends string> =
  T extends `${infer Start}{{${infer Var}}}${infer Rest}`
    ? Var | ExtractTemplateVariables<Rest>
    : never;

export type TemplateVariables<T extends string> = Pretty<{
  [K in ExtractTemplateVariables<T>]: string | string[] | object;
}>;

// export type AgentMemory = {
//     working: WorkingMemory;
//     shortTerm: {};
// };

export type Expert<Context = any> = {
  type: string;
  description: string;
  instructions: string;
  model?: LanguageModelV1;
  actions?: Action<any, any, Context>[];
};

export interface AgentContext<Memory extends WorkingMemory = WorkingMemory> {
  id: string;
  memory: Memory;
}

export interface Agent<
  Memory extends WorkingMemory = WorkingMemory,
  T extends ContextHandler<Memory> = ContextHandler<Memory>,
> {
  // context: Context;

  memory: MemoryStore;

  context: T;

  inputs: Record<string, InputConfig<any, InferContextFromHandler<T>>>;
  outputs: Record<
    string,
    Omit<Output<any, InferContextFromHandler<T>>, "type">
  >;

  events: Record<string, z.AnyZodObject>;

  experts: Record<string, ExpertConfig<InferContextFromHandler<T>>>;

  actions: Action<any, any, InferContextFromHandler<T>>[];

  //
  emit: (...args: any[]) => void;
  run: (conversationId: string) => Promise<void>;
  send: (
    conversationId: string,
    input: { type: string; data: any }
  ) => Promise<void>;
  evaluator: (ctx: InferContextFromHandler<T>) => Promise<void>;
}

export type ContextHandler<T extends WorkingMemory = WorkingMemory> = (
  memory: MemoryStore
) => {
  get: (id: string) => Promise<{ id: string; memory: T }>;
  save: (id: string, data: T) => Promise<void>;
  render: (data: T) => string | string[];
};

export type InferMemoryFromHandler<THandler extends ContextHandler<any>> =
  THandler extends ContextHandler<infer Memory> ? Memory : unknown;

export type InferContextFromHandler<THandler extends ContextHandler<any>> =
  AgentContext<InferMemoryFromHandler<THandler>>;

export type Config<
  TMemory extends WorkingMemory = WorkingMemory,
  TContextHandler extends ContextHandler<TMemory> = ContextHandler<TMemory>,
  Context = InferContextFromHandler<TContextHandler>,
> = {
  // context: Context;
  memory: MemoryStore;
  context?: TContextHandler;
  inputs: Record<string, InputConfig<any, Context>>;
  outputs: Record<string, OutputConfig<any, Context>>;

  events: Record<string, z.AnyZodObject>;

  experts: Record<string, ExpertConfig<Context>>;

  actions: Action<any, any, Context>[];

  model: LanguageModelV1;
  reasioningModel?: LanguageModelV1;

  logger: LogLevel;
};

export type InputConfig<
  T extends z.AnyZodObject = z.AnyZodObject,
  Context = any,
> = Omit<Input<T, Context>, "type">;

export type OutputConfig<
  T extends OutputSchema = OutputSchema,
  Context = any,
> = Omit<Output<T, Context>, "type">;

export type ExpertConfig<Context = any> = Omit<Expert<Context>, "type">;

export type Subscription = () => void;

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogWriter {
  init(logPath: string): void;
  write(data: string): void;
}

export interface LoggerConfig {
  level: LogLevel;
  enableTimestamp?: boolean;
  enableColors?: boolean;
  logToFile?: boolean;
  logPath?: string;
  logWriter?: LogWriter;
}

export interface LogEntry {
  level: LogLevel;
  timestamp: Date;
  context: string;
  message: string;
  data?: any;
}
