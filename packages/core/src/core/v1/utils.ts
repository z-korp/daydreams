import { z } from "zod";
import type {
    Action,
    ExpertConfig,
    InputConfig,
    OutputConfig,
    TemplateVariables,
} from "./types";

/**
 * Renders a template string by replacing variables with provided values
 * @template Template - The template string type containing variables in {{var}} format
 * @param str - The template string to render
 * @param data - Object containing values for template variables
 * @returns The rendered string with variables replaced
 */
export function render<Template extends string>(
    str: Template,
    data: TemplateVariables<Template>
) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        formatValue(data[key as keyof typeof data] ?? "")
    );
}

/**
 * Formats a value for template rendering
 * @param value - The value to format
 * @returns Formatted string representation of the value
 */
export function formatValue(value: any): string {
    if (Array.isArray(value))
        return value.map((t) => formatValue(t)).join("\n");
    if (typeof value !== "string") return JSON.stringify(value);
    return value;
}

/**
 * Creates an input configuration
 * @template Schema - Zod schema type for input validation
 * @template Context - Context type for input handling
 * @param config - Input configuration object
 * @returns Typed input configuration
 */
export function input<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
>(config: InputConfig<Schema, Context>): InputConfig<Schema, Context> {
    return config;
}

/**
 * Creates an action configuration
 * @template Schema - Zod schema type for action parameters
 * @template Result - Return type of the action
 * @template Context - Context type for action execution
 * @param action - Action configuration object
 * @returns Typed action configuration
 */
export function action<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Result = any,
    Context = any,
>(action: Action<Schema, Result, Context>): Action<Schema, Result, Context> {
    return action;
}

/**
 * Creates an output configuration
 * @template Schema - Zod schema type for output validation
 * @template Context - Context type for output handling
 * @param config - Output configuration object
 * @returns Typed output configuration
 */
export function output<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
>(config: OutputConfig<Schema, Context>): OutputConfig<Schema, Context> {
    return config;
}

/**
 * Creates an expert configuration
 * @template Context - Context type for expert execution
 * @param config - Expert configuration object
 * @returns Typed expert configuration
 */
export function expert<Context = any>(
    config: ExpertConfig<Context>
): ExpertConfig<Context> {
    return config;
}
