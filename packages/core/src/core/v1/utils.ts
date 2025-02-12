import { z } from "zod";
import type {
  Action,
  Agent,
  AgentContext,
  AnyContext,
  Context,
  ExpertConfig,
  InputConfig,
  Memory,
  OutputConfig,
  OutputSchema,
  TemplateVariables,
  WorkingMemory,
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
  return str
    .trim()
    .replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
      formatValue(data[key as keyof typeof data] ?? "")
    );
}

/**
 * Formats a value for template rendering
 * @param value - The value to format
 * @returns Formatted string representation of the value
 */
export function formatValue(value: any): string {
  if (Array.isArray(value)) return value.map((t) => formatValue(t)).join("\n");
  if (typeof value !== "string") return JSON.stringify(value);
  return value.trim();
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
  Context extends AgentContext<WorkingMemory, AnyContext> = AgentContext<
    WorkingMemory,
    AnyContext
  >,
  TAgent extends Agent<any, any> = Agent<any, any>,
>(config: InputConfig<Schema, Context, TAgent>) {
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
  Context extends AgentContext<WorkingMemory, AnyContext> = AgentContext<
    WorkingMemory,
    AnyContext
  >,
  TAgent extends Agent<any, any> = Agent<any, any>,
  TMemory extends Memory<any> = never,
>(action: Action<Schema, Result, Context, TAgent, TMemory>) {
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
  Schema extends OutputSchema = OutputSchema,
  Context extends AgentContext<WorkingMemory, AnyContext> = AgentContext<
    WorkingMemory,
    AnyContext
  >,
>(config: OutputConfig<Schema, Context>) {
  return config;
}

/**
 * Creates an expert configuration
 * @template Context - Context type for expert execution
 * @param config - Expert configuration object
 * @returns Typed expert configuration
 */
export function expert<Context = any>(config: ExpertConfig<Context>) {
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

export function context<
  Memory extends WorkingMemory = WorkingMemory,
  Args extends z.ZodTypeAny = any,
  Ctx = any,
  Exports = any,
>(ctx: Context<Memory, Args, Ctx, Exports>) {
  return ctx;
}

export function memory<Data = any>(memory: Memory<Data>) {
  return memory;
}
