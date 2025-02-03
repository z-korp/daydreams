// processor.ts

import { Logger } from "./logger";
import { LogLevel, type Character, type ProcessedResult } from "./types";
import { HandlerRole, type IOHandler, type ProcessableContent } from "./types";

import type { HandlerInterface } from "./new";
import type { MemoryManager } from "./memory";
import type { z } from "zod";
import type { LLMClient } from "./llm-client";

export interface ProcessorInterface {
    // hold the schema
    outputSchema: z.ZodType;

    // hold the processors
    processors: Map<string, BaseProcessor>;

    // hold the always child processor
    alwaysChildProcessor?: BaseProcessor;

    // hold the IOHandlers
    handlers: HandlerInterface;

    // based on inputs and outputs
    process: (content: ProcessableContent) => Promise<ProcessedResult>;

    // based on inputs and outputs
    evaluate: (result: ProcessedResult) => Promise<boolean>;

    run: (content: ProcessableContent | ProcessableContent[]) => Promise<ProcessedResult | ProcessedResult[]>;

    // based on inputs and outputs
    getHandler(name: string): IOHandler | undefined;

    // memory manager // what it's done
    // memory: MemoryManager;
}

export abstract class BaseProcessor implements ProcessorInterface {
    /** Logger instance for this processor */
    protected logger: Logger;
    /** Map of child processors (sub-processors) that this processor can delegate to */
    public processors: Map<string, BaseProcessor> = new Map();

    /** Map of unsubscribe functions for various handlers, keyed by handler name. */
    private unsubscribers = new Map<string, () => void>();

    constructor(
        public outputSchema: z.ZodType,
        public handlers: HandlerInterface,
        // public memory: MemoryManager,
        protected metadata: { name: string; description: string },
        protected loggerLevel: LogLevel,
        protected character: Character,
        protected llmClient: LLMClient, // your LLM client type
        protected contentLimit: number = 1000,
        public alwaysChildProcessor?: BaseProcessor,
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
    /**
     * Gets a child processor by name
     */
    public getProcessor(name: string): BaseProcessor | undefined {
        return this.processors.get(name);
    }

    public abstract evaluate(result: ProcessedResult): Promise<boolean>;

    public async run(content: ProcessableContent | ProcessableContent[]): Promise<ProcessedResult | ProcessedResult[]> {

        if (Array.isArray(content)) {
            return Promise.all(content.map(c => this.process(c)));
        }

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
