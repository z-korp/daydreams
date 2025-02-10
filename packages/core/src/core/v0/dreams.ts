import type { BaseProcessor } from "./processor";
import { HandlerRole, type IOHandler, type ProcessableContent } from "./types";
import { EventEmitter } from "events";

export interface DreamsConfig {
  handlers?: IOHandler[];
}

export interface ProcessorMapping {
  processorName: string;
  // Optional filter to determine if this processor should handle the input
  filter?: (data: any) => boolean;
  // Optional next processor to chain to
  next?: string;
}

// Define the events that can be emitted
export interface DreamsEvents {
  "input:received": (handlerName: string, data: any) => void;
  "input:processed": (
    handlerName: string,
    result: ProcessableContent | ProcessableContent[]
  ) => void;
  "processor:route": (
    processorName: string,
    data: ProcessableContent | ProcessableContent[]
  ) => void;
  error: (error: Error, context: any) => void;
}

export function createProcessor(config: DreamsConfig) {
  const handlers = new Map<string, IOHandler>();
  // Map input handlers to their processors
  const processorMappings = new Map<string, ProcessorMapping[]>();
  // Map to store processor chains
  const processorChains = new Map<string, string>();

  const events = new EventEmitter();

  // Initialize with any provided handlers
  if (config.handlers) {
    config.handlers.forEach((handler) => {
      handlers.set(handler.name, handler);
    });
  }

  function registerHandler(
    handler: IOHandler,
    processorMapping?: ProcessorMapping
  ) {
    handlers.set(handler.name, handler);

    // If this is an input handler and has a processor mapping, store it
    if (handler.role === HandlerRole.INPUT && processorMapping) {
      const existingMappings = processorMappings.get(handler.name) || [];
      processorMappings.set(handler.name, [
        ...existingMappings,
        processorMapping,
      ]);

      // If there's a next processor specified, store the chain
      if (processorMapping.next) {
        processorChains.set(
          processorMapping.processorName,
          processorMapping.next
        );
      }
    }
  }

  function getHandler(name: string): IOHandler | undefined {
    return handlers.get(name);
  }

  async function processInput(
    handler: string,
    data: any
  ): Promise<ProcessableContent | ProcessableContent[] | undefined> {
    try {
      // Emit received event
      events.emit("input:received", handler, data);

      const inputHandler = handlers.get(handler);
      if (
        !inputHandler ||
        inputHandler.role !== HandlerRole.INPUT ||
        !inputHandler.execute
      ) {
        throw new Error(`Invalid or missing input handler: ${handler}`);
      }

      // Get the processed input
      const input = await inputHandler.execute(data);

      // Process the input
      const output = await process(input);

      // Emit processed event
      events.emit("input:processed", handler, output);

      return input;
    } catch (error) {
      events.emit("error", error, { handler, data });
      throw error;
    }
  }

  async function process(content: ProcessableContent | ProcessableContent[]) {
    const contents = Array.isArray(content) ? content : [content];

    for (const item of contents) {
      try {
        // Find the appropriate processor mappings
        const mappings = Array.from(processorMappings.values()).flat();

        // Find the first matching processor based on filters
        const mapping = mappings.find((m) => !m.filter || m.filter(item));

        if (mapping) {
          // Emit routing event
          events.emit("processor:route", mapping.processorName, item);

          // Get the processor handler
          const processor = handlers.get(mapping.processorName);
          if (processor && processor.execute) {
            // Process the content
            const result = await processor.execute(item);

            // Check if there's a next processor in the chain
            const nextProcessor = processorChains.get(mapping.processorName);
            if (nextProcessor && result) {
              // Continue the chain with the result
              return process(result);
            }

            return result;
          }
        }
      } catch (error) {
        events.emit("error", error, { content: item });
        throw error;
      }
    }
  }

  // Type-safe event listener registration
  function on<K extends keyof DreamsEvents>(
    event: K,
    listener: DreamsEvents[K]
  ) {
    events.on(event, listener);
    return () => events.off(event, listener);
  }

  return {
    registerHandler,
    getHandler,
    processInput,
    on,
  };
}
