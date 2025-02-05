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

export type Action = {
    name: string;
    description: string;
    params: z.AnyZodObject;
};

export type Output = {
    type: string;
    description: string;
    params: z.AnyZodObject | z.ZodString;
};

export type Input = {
    type: string;
    description: string;
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

export type ActionCall = {
    name: string;
    data: any;
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
