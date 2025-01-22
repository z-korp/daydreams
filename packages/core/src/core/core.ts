import { Logger } from "./logger";
import { Room } from "./room";
import { RoomManager } from "./room-manager";
import type { VectorDB } from "./vector-db";
import { LogLevel } from "../types";
import type { JSONSchemaType } from "ajv";
import type { Processor } from "./processor";

// Input interface for scheduled or one-time tasks
export interface Input {
  name: string;
  handler: (...args: any[]) => Promise<any>;
  response: any; // Type of response expected
  interval?: number; // Time in milliseconds between runs, if not provided runs once
}

// Output interface for actions that push data somewhere
export interface Output {
  name: string;
  handler: (data: any) => Promise<any>;
  response: any; // Type of response expected
  schema: JSONSchemaType<any>; // Schema to validate input data
}

export interface CoreConfig {
  logging?: {
    level: LogLevel;
    enableColors?: boolean;
    enableTimestamp?: boolean;
  };
}

export class Core {
  private inputs: Map<string, Input & { lastRun?: number }> = new Map();
  private outputs: Map<string, Output> = new Map();
  private logger: Logger;
  private roomManager: RoomManager;
  private processor: Processor;
  public readonly vectorDb: VectorDB;

  constructor(
    roomManager: RoomManager,
    vectorDb: VectorDB,
    processor: Processor,
    config?: CoreConfig
  ) {
    this.roomManager = roomManager;
    this.vectorDb = vectorDb;
    this.logger = new Logger(
      config?.logging ?? {
        level: LogLevel.INFO,
        enableColors: true,
        enableTimestamp: true,
      }
    );

    this.processor = processor;

    // Start input processing loop
    this.processInputs();

    // Register available outputs with processor
    this.outputs.forEach((output) => {
      this.processor.registerAvailableOutput(output);
    });
  }

  /**
   * Register a new input source
   */
  public registerInput(input: Input): void {
    this.logger.info("Core.registerInput", "Registering input", {
      name: input.name,
    });

    this.inputs.set(input.name, input);
  }

  /**
   * Register a new output destination
   */
  public registerOutput(output: Output): void {
    this.logger.info("Core.registerOutput", "Registering output", {
      name: output.name,
    });

    this.outputs.set(output.name, output);
  }

  /**
   * Process registered inputs on intervals
   */
  private async processInputs(): Promise<void> {
    while (true) {
      for (const [name, input] of this.inputs.entries()) {
        const now = Date.now();

        // Skip if not ready to run again
        if (
          input.interval &&
          input.lastRun &&
          now - input.lastRun < input.interval
        ) {
          continue;
        }

        try {
          this.logger.debug("Core.processInputs", "Processing input", { name });

          const result = await input.handler();

          // Update last run time
          this.inputs.set(name, {
            ...input,
            lastRun: now,
          });

          // Store result in room memory
          if (result) {
            const room = await this.ensureRoom(name);

            const processed = await this.processor.process(result, room);

            await this.roomManager.addMemory(
              room.id,
              JSON.stringify(processed.content), // TODO: Fix this everything being dumped into memory
              {
                source: name,
                type: "input",
                ...processed.metadata,
                ...processed.enrichedContext,
              }
            );

            // Handle suggested outputs
            for (const suggestion of processed.suggestedOutputs) {
              if (suggestion.confidence >= 0.7) {
                // Configurable threshold
                try {
                  this.logger.info(
                    "Core.processInputs",
                    "Executing suggested output",
                    {
                      name: suggestion.name,
                      confidence: suggestion.confidence,
                      reasoning: suggestion.reasoning,
                    }
                  );
                  await this.executeOutput(suggestion.name, suggestion.data);
                } catch (error) {
                  this.logger.error(
                    "Core.processInputs",
                    "Error executing suggested output",
                    { error }
                  );
                }
              }
            }
          }
        } catch (error) {
          this.logger.error("Core.processInputs", "Error processing input", {
            name,
            error,
          });
        }
      }

      // Small delay between iterations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  /**
   * Execute an output with data
   */
  public async executeOutput(name: string, data: any): Promise<any> {
    const output = this.outputs.get(name);
    if (!output) {
      throw new Error(`No output registered with name: ${name}`);
    }

    // Validate data against schema
    try {
      const Ajv = require("ajv");
      const ajv = new Ajv();
      const validate = ajv.compile(output.schema);

      if (!validate(data)) {
        this.logger.error("Core.executeOutput", "Schema validation failed", {
          name,
          data,
          errors: validate.errors,
          schema: output.schema,
        });
        throw new Error(
          `Invalid data for output ${name}: ${JSON.stringify(validate.errors)}`
        );
      }

      this.logger.debug("Core.executeOutput", "Executing output", {
        name,
        data,
        schema: output.schema,
      });

      const result = await output.handler(data);

      // Store in room memory
      const room = await this.ensureRoom(name);
      const processed = await this.processor.process(result, room);

      await this.roomManager.addMemory(room.id, processed.content, {
        source: name,
        type: "output",
        ...processed.metadata,
        ...processed.enrichedContext,
      });

      return result;
    } catch (error) {
      this.logger.error("Core.executeOutput", "Error executing output", {
        name,
        data,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  private async ensureRoom(name: string): Promise<Room> {
    let room = await this.roomManager.getRoomByPlatformId(name, "core");

    if (!room) {
      room = await this.roomManager.createRoom(name, "core", {
        name,
        description: `Room for ${name}`,
        participants: [],
      });
    }

    return room;
  }

  /**
   * Remove an input
   */
  public removeInput(name: string): void {
    this.inputs.delete(name);
  }

  /**
   * Remove an output
   */
  public removeOutput(name: string): void {
    this.outputs.delete(name);
  }
}
