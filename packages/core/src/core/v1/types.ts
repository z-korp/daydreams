import { type LanguageModelV1 } from "ai";
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

export type WorkingMemory = {
    inputs: InputRef[];
    outputs: OutputRef[];
    thoughts: string[];
    calls: ActionCall[];

    chains: Chain[];
};

export type Action<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Result = any,
    Context = any,
> = {
    name: string;
    description?: string;
    params: Schema;
    handler: (params: z.infer<Schema>, ctx: Context) => Promise<Result>;
};

export type Output<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
> = {
    type: string;
    description: string;
    params: Schema;
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
    type: string;
    data: any;
    params?: Record<string, string>;
    timestamp: number;
    processed?: boolean;
};

export type OutputRef = {
    type: string;
    data: any;
    params?: Record<string, string>;
    timestamp: number;
};

export type ActionCall<Data = any, Result = any> = {
    id: string;
    name: string;
    data: Data;
    result?: Result;
};

export type COTProps = {
    model: LanguageModelV1;
    plan: string;
    inputs: InputRef[];
    actions: Action[];
    outputs: Output[];
    thoughts: string[];
    conversation: (InputRef | OutputRef)[];
};

export type COTResponse = {
    thinking: string[];
    plan: string[];
    actions: ActionCall[];
    outputs: OutputRef[];
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
    [K in ExtractTemplateVariables<T>]: string;
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

export interface AgentContext {
    conversationId: string;
    memory: WorkingMemory;
}

export interface Agent<Context extends AgentContext = AgentContext> {
    // context: Context;

    memory: MemoryStore;

    inputs: Record<string, InputConfig<any, Context>>;
    outputs: Record<string, Omit<Output<any, Context>, "type">>;

    events: Record<string, z.AnyZodObject>;

    experts: Record<string, ExpertConfig<Context>>;

    actions: Action<any, any, Context>[];

    //
    emit: (...args: any[]) => void;
    run: (conversationId: string) => Promise<void>;
    send: (
        conversationId: string,
        input: { type: string; data: any }
    ) => Promise<void>;
    evaluator: (ctx: Context) => Promise<void>;
}

export type Config<Context extends AgentContext = AgentContext> = {
    // context: Context;
    memory: MemoryStore;

    inputs: Record<string, InputConfig<any, Context>>;
    outputs: Record<string, OutputConfig<any, Context>>;

    events: Record<string, z.AnyZodObject>;

    experts: Record<string, ExpertConfig<Context>>;

    actions: Action<any, any, Context>[];

    model: LanguageModelV1;

    logger: LogLevel;
};

export type InputConfig<
    T extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
> = Omit<Input<T, Context>, "type">;

export type OutputConfig<
    T extends z.AnyZodObject = z.AnyZodObject,
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
