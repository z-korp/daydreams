import { z } from "zod";
import { Action, InputConfig, TemplateVariables } from "./types";

export function render<Template extends string>(
    str: Template,
    data: TemplateVariables<Template>
) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) =>
        formatValue(data[key] ?? "")
    );
}

export function formatValue(value: any) {
    if (Array.isArray(value))
        return value.map((t) => formatValue(t)).join("\n");
    if (typeof value !== "string") return JSON.stringify(value);
    return value;
}

export function input<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
>(config: InputConfig<Schema, Context>): InputConfig<Schema, Context> {
    return config;
}

export function action<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Result = any,
    Context = any,
>(action: Action<Schema, Result, Context>): Action<Schema, Result, Context> {
    return action;
}
