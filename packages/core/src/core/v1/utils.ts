import { z } from "zod";
import type {
    Action,
    ExpertConfig,
    InputConfig,
    OutputConfig,
    TemplateVariables,
} from "./types";

export function render<Template extends string>(
    str: Template,
    data: TemplateVariables<Template>
) {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        formatValue(data[key as keyof typeof data] ?? "")
    );
}

export function formatValue(value: any): string {
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

export function output<
    Schema extends z.AnyZodObject = z.AnyZodObject,
    Context = any,
>(config: OutputConfig<Schema, Context>): OutputConfig<Schema, Context> {
    return config;
}

export function expert<Context = any>(
    config: ExpertConfig<Context>
): ExpertConfig<Context> {
    return config;
}

interface ChunkOptions {
    maxChunkSize: number;
}

export function splitTextIntoChunks(
    text: string,
    options: ChunkOptions
): string[] {
    const { maxChunkSize } = options;
    const lines = text.split("\n");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const line of lines) {
        // If adding this line would exceed maxChunkSize, start a new chunk
        if (currentChunk.length + line.length + 1 > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = line;
        } else {
            // Add line to current chunk with a newline
            currentChunk = currentChunk ? currentChunk + "\n" + line : line;
        }
    }

    // Don't forget to add the last chunk
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
