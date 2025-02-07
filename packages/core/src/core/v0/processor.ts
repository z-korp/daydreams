// processor.ts

import { Logger } from "./logger";
import { LogLevel, type Character, type ProcessedResult } from "./types";
import { HandlerRole, type IOHandler, type ProcessableContent } from "./types";

import type { HandlerInterface } from "./new";
import type { MemoryManager } from "./memory";
import type { z } from "zod";
import type { LLMClient } from "./llm-client";
import { Handler } from "./orchestrator";

export interface ProcessorInterface {
    // hold the schema
    outputSchema: z.ZodType;

    // hold the processors
    processors: Map<string, BaseProcessor>;

    // hold the IOHandlers
    handlers: HandlerInterface;

    // based on inputs and outputs
    process: (content: ProcessableContent) => Promise<ProcessedResult>;

    // based on inputs and outputs
    evaluate: (result: ProcessedResult) => Promise<boolean>;

    run: (content: ProcessableContent | ProcessableContent[]) => Promise<ProcessedResult | ProcessedResult[]>;

    // based on inputs and outputs
    getHandler(name: string): IOHandler | undefined;
}

export abstract class BaseProcessor implements ProcessorInterface {
    /** Logger instance for this processor */
    protected logger: Logger;

    /** Map of child processors (sub-processors) that this processor can delegate to */
    public processors: Map<string, BaseProcessor> = new Map();

    /** Map of unsubscribe functions for various handlers, keyed by handler name. */
    private unsubscribers = new Map<string, () => void>();

    public handlers: HandlerInterface = new Handler();

    constructor(
        protected metadata: { name: string; description: string },
        protected llmClient: LLMClient,
        public outputSchema: z.ZodType,
        protected contentLimit: number = 1000,
        protected loggerLevel: LogLevel = LogLevel.ERROR,

    ) {
        this.logger = new Logger({
            level: loggerLevel,
            enableColors: true,
            enableTimestamp: true,
        });
    }

    /**
     * Gets the name of this processor
     */
    public getName(): string {
        return this.metadata.name;
    }

    /**
     * Gets the description of this processor
     */
    public getDescription(): string {
        return this.metadata.description;
    }

    /**
     * Determines if this processor can handle the given content.
     */
    public abstract canHandle(content: any): boolean;

    /**
     * Processes the given content and returns a result.
     */
    public abstract process(
        content: ProcessableContent
    ): Promise<ProcessedResult>;

    /**
     * Adds one or more child processors to this processor
     */
    public addProcessor(processors: BaseProcessor | BaseProcessor[]): this {
        const toAdd = Array.isArray(processors) ? processors : [processors];

        for (const processor of toAdd) {
            const name = processor.getName();
            if (this.processors.has(name)) {
                throw new Error(`Processor with name '${name}' already exists`);
            }
            this.processors.set(name, processor);
        }
        return this;
    }

    public addStream(handler: IOHandler): void {
        this.handlers.ioHandlers.set(handler.name, handler);

        if (handler.role === HandlerRole.INPUT && handler.subscribe) {
            const unsubscribe = handler.subscribe(async (data) => {
                this.logger.info(
                    "Orchestrator.registerIOHandler",
                    "Starting stream",
                    { data }
                );
                // called to start the flow
                await this.run(data);
            });
            this.unsubscribers.set(handler.name, unsubscribe);
        }

        this.logger.info(
            "Orchestrator.registerIOHandler",
            `Registered ${handler.role}`,
            { name: handler.name }
        );
    }

    public registerIOHandler(handler: IOHandler): void {
        if (this.handlers.ioHandlers.has(handler.name)) {
            this.logger.warn(
                "Orchestrator.registerIOHandler",
                "Overwriting handler with same name",
                { name: handler.name }
            );
        }

        this.handlers.ioHandlers.set(handler.name, handler);

        this.logger.info(
            "Orchestrator.registerIOHandler",
            `Registered ${handler.role}`,
            { name: handler.name }
        );
    }


    /**
     * Removes a handler (input or output) by name and stops its scheduling if needed.
     */
    public removeIOHandler(name: string): void {
        this.handlers.ioHandlers.delete(name);
        this.logger.info("Orchestrator.removeIOHandler", "Removed IOHandler", {
            name,
        });
    }

    /**
     * Dispatches data to a registered *output* handler by name.
     */
    public async dispatchToOutput<T>(
        name: string,
        data: ProcessableContent
    ): Promise<unknown> {
        const handler = this.handlers.ioHandlers.get(name);
        if (!handler || !handler.execute) {
            throw new Error(`No IOHandler registered with name: ${name}`);
        }
        if (handler.role !== HandlerRole.OUTPUT) {
            throw new Error(`Handler "${name}" is not an output handler`);
        }

        this.logger.debug("Orchestrator.dispatchToOutput", "Executing output", {
            name,
            data,
        });

        try {
            const result = await handler.execute(data);
            this.logger.info("Orchestrator.dispatchToOutput", "Output result", {
                result,
            });
            return result;
        } catch (error) {
            this.logger.error(
                "Orchestrator.dispatchToOutput",
                "Handler threw an error",
                { name, error }
            );
            throw error;
        }
    }

    /**
     * Dispatches data to a registered *action* handler by name.
     */
    public async dispatchToAction<T>(
        name: string,
        data: ProcessableContent
    ): Promise<unknown> {
        const handler = this.handlers.ioHandlers.get(name);
        if (!handler || !handler.execute) {
            throw new Error(`No IOHandler registered with name: ${name}`);
        }
        if (handler.role !== HandlerRole.ACTION) {
            throw new Error(`Handler "${name}" is not an action handler`);
        }

        try {
            const result = await handler.execute(data);
            this.logger.debug(
                "Orchestrator.dispatchToAction",
                "Executing action",
                {
                    name,
                    data,
                }
            );
            return result;
        } catch (error) {
            this.logger.error(
                "Orchestrator.dispatchToAction",
                "Handler threw an error",
                { name, error }
            );
            throw error;
        }
    }

    /**
     * Gets a child processor by name
     */
    public getProcessor(name: string): BaseProcessor | undefined {
        return this.processors.get(name);
    }

    public abstract evaluate(result: ProcessedResult): Promise<boolean>;

    public async run(content: ProcessableContent | ProcessableContent[]): Promise<ProcessedResult | ProcessedResult[]> {

        this.logger.info("Processor.run", "Running", { content });
        if (Array.isArray(content)) {
            return Promise.all(content.map(c => this.process(c)));
        }


        this.logger.info("Processor.run", "Processing content", { content });
        const result = await this.process(content);

        this.logger.info("Processor.run", "Result", { result });

        if (result.suggestedOutputs?.length > 0) {
            const outputs = await Promise.all(
                result.suggestedOutputs.map(async (suggestedOutput) => {
                    const handler = this.handlers?.ioHandlers?.get(suggestedOutput.name);

                    if (handler && handler.execute) {
                        return handler.execute(content);
                    }

                    return null;
                })
            );

            const validOutput = outputs.find(output => output !== null);
            if (validOutput) {
                return validOutput;
            }
        }

        return result;
    }

    public getHandler(name: string): IOHandler | undefined {
        return this.handlers.ioHandlers.get(name);
    }
}
