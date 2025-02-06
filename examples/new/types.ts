import { LanguageModelV1 } from "ai";
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
};

export type InputRef = {
    type: string;
    data: any;
    params?: Record<string, string>;
};

export type OutputRef = {
    type: string;
    data: any;
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

export type AgentMemory = {
    working: WorkingMemory;
    shortTerm: {};
};

export type Expert = {};

export interface AgentContext {
    memory: AgentMemory;
}

export interface Agent<Context extends AgentContext = AgentContext> {
    // context: Context;

    memory: AgentMemory;

    inputs: Record<string, InputConfig<any, Context>>;
    outputs: Record<string, Omit<Output<any, Context>, "type">>;

    events: Record<string, z.AnyZodObject>;

    experts?: Record<string, Expert>;

    actions: Action<any, any, Context>[];

    //
    emit: (...args: any[]) => void;
    run: () => Promise<void>;
    send: (input: { type: string; data: any }) => Promise<void>;
}

export type Config<Context extends AgentContext = AgentContext> = {
    // context: Context;

    inputs: Record<string, InputConfig<any, Context>>;
    outputs: Record<string, Omit<Output<any, Context>, "type">>;

    events: Record<string, z.AnyZodObject>;

    experts?: Record<string, Expert>;

    actions: Action<any, any, Context>[];

    model: LanguageModelV1;
};

export type InputConfig<
    T extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
> = Omit<Input<T, Context>, "type">;

export type OutputConfig<
    T extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
> = Omit<Output<T, Context>, "type">;
