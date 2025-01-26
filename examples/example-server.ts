import { WebSocketServer, WebSocket } from "ws";
import chalk from "chalk";
import { z } from "zod";

import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { Character, HandlerRole } from "../packages/core/src/core/types";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { defaultCharacter } from "../packages/core/src/core/character";
import { LogLevel } from "../packages/core/src/core/types";
import { ScheduledTaskMongoDb } from "../packages/core/src/core/scheduled-db";
class OrchestratorManager {
  private orchestrators: Map<string, Orchestrator> = new Map();
  private roomManagers: Map<string, RoomManager> = new Map();
  private scheduledTaskDb: ScheduledTaskMongoDb;

  constructor() {
    this.scheduledTaskDb = new ScheduledTaskMongoDb(
      "mongodb://localhost:27017",
      "myApp",
      "scheduled_tasks"
    );
  }

  async initialize() {
    await this.scheduledTaskDb.connect();
    await this.scheduledTaskDb.deleteAll();
    console.log(chalk.green("✅ Scheduled task database connected"));
  }

  async createOrchestrator(name: string, config = { logLevel: LogLevel.INFO }, character?: Character) {
    console.log(chalk.blue(`[OrchestratorManager] Creating new orchestrator '${name}'`));
    console.log(chalk.gray(`[OrchestratorManager] Config:`, JSON.stringify(config, null, 2)));
    const id = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const llmClient = new LLMClient({
      model: "anthropic/claude-3-5-sonnet-latest",
      temperature: 0.3,
    });

    const vectorDb = new ChromaVectorDB(`memory_${id}`, {
      chromaUrl: "http://localhost:8000",
      logLevel: config.logLevel,
    });

    const roomManager = new RoomManager(vectorDb);
    this.roomManagers.set(id, roomManager);

    const processor = new MessageProcessor(
      llmClient,
      character || defaultCharacter,
      config.logLevel
    );

    const orchestrator = new Orchestrator(
      roomManager,
      vectorDb,
      [processor],
      this.scheduledTaskDb,
      {
        level: config.logLevel,
        enableColors: true,
        enableTimestamp: true,
      }
    );

    orchestrator.registerIOHandler({
      name: "user_chat",
      role: HandlerRole.INPUT,
      schema: z.object({
        content: z.string(),
        userId: z.string().optional(),
      }),
      handler: async (payload) => {
        return payload;
      },
    });

    orchestrator.registerIOHandler({
      name: "chat_reply",
      role: HandlerRole.OUTPUT,
      schema: z.object({
        userId: z.string().optional(),
        message: z.string(),
      }),
      handler: async (payload) => {
        const { userId, message } = payload as {
          userId?: string;
          message: string;
        };
        console.log(`[Orchestrator ${id}] Reply to user ${userId ?? "??"}: ${message}`);
      },
    });

    this.orchestrators.set(id, orchestrator);
    return { id, name, orchestrator };
  }

  getOrchestrator(id: string) {
    return this.orchestrators.get(id);
  }

  listOrchestrators() {
    console.log(chalk.blue("[OrchestratorManager] Listing orchestrators"));
    const orchestrators = Array.from(this.orchestrators.entries()).map(([id, orchestrator]) => ({
      id,
      name: `Orchestrator ${id}`
    }));
    console.log(chalk.blue("[OrchestratorManager] Listing orchestrators:", JSON.stringify(orchestrators, null, 2)));
    return orchestrators;
  }
}

// Initialize orchestrator manager
const orchestratorManager = new OrchestratorManager();
await orchestratorManager.initialize();
const defaultOrch = await orchestratorManager.createOrchestrator("Default Orchestrator");

// WebSocket Server
const wss = new WebSocketServer({ port: 8080 });
console.log(chalk.green("[WS] WebSocket server listening on ws://localhost:8080"));

function sendJSON(ws: WebSocket, data: unknown) {
  ws.send(JSON.stringify(data));
}

wss.on("connection", (ws) => {
  console.log(chalk.blue("[WS] New client connected."));

  sendJSON(ws, {
    type: "welcome",
    message: "Welcome to Daydreams WebSocket server!",
    orchestrators: orchestratorManager.listOrchestrators(),
  });

  ws.on("message", async (rawData) => {
    try {
      const dataString = rawData.toString();
      console.log(chalk.magenta("[WS] Received message:"), dataString);

      const parsed = JSON.parse(dataString);
      
      switch (parsed.type) {
        case "create_character":
          {
            const { name, bio, traits, voice, instructions, templates } = parsed;
            const character = {
              name,
              bio,
              traits,
              voice,
              instructions,
              templates
            };
            
            const newOrch = await orchestratorManager.createOrchestrator(
              name, 
              { logLevel: LogLevel.INFO },
              character
            );

            sendJSON(ws, {
              type: "character_created",
              character: {
                id: newOrch.id,
                ...character,
              },
            });
          }
          break;
        case "create_orchestrator":
          if (!parsed.name) {
            throw new Error("Orchestrator name is required");
          }
          const newOrch = await orchestratorManager.createOrchestrator(parsed.name);
          sendJSON(ws, {
            type: "orchestrator_created",
            orchestrator: {
              id: newOrch.id,
              name: newOrch.name,
            },
          });
          break;

        case "list_orchestrators":
          sendJSON(ws, {
            type: "orchestrators_list",
            orchestrators: orchestratorManager.listOrchestrators(),
          });
          break;

        case "user":
          if (!parsed.orchestratorId) {
            throw new Error("Orchestrator ID is required");
          }
          const orchestrator = orchestratorManager.getOrchestrator(parsed.orchestratorId);
          if (!orchestrator) {
            throw new Error("Orchestrator not found");
          }

          sendJSON(ws, {
            type: "debug",
            messageType: "user_input",
            message: parsed.message,
            orchestratorId: parsed.orchestratorId,
            timestamp: Date.now()
          });

          console.log(chalk.blue(`[WS] Dispatching message to orchestrator ${parsed.orchestratorId}`));
          
          sendJSON(ws, {
            type: "debug",
            messageType: "processing_start",
            message: `Processing message for orchestrator ${parsed.orchestratorId}`,
            orchestratorId: parsed.orchestratorId,
            timestamp: Date.now()
          });
          
          try {
            const outputs = await orchestrator.dispatchToInput("user_chat", {
              content: parsed.message,
              userId: "ws-user",
            });

            console.log(chalk.blue(`[WS] Got outputs:`, outputs));

            sendJSON(ws, {
              type: "debug",
              messageType: "raw_outputs",
              message: "Raw outputs from orchestrator",
              data: outputs,
              orchestratorId: parsed.orchestratorId,
              timestamp: Date.now()
            });

            if (outputs && Array.isArray(outputs)) {
              for (const out of outputs) {
                if (out.name === "chat_reply") {
                  sendJSON(ws, {
                    type: "debug",
                    messageType: "ai_response",
                    message: out.data.message,
                    orchestratorId: parsed.orchestratorId,
                    timestamp: Date.now()
                  });

                  sendJSON(ws, {
                    type: "response",
                    message: out.data.message,
                    orchestratorId: parsed.orchestratorId,
                    timestamp: Date.now()
                  });
                }
              }
            }
          } catch (error) {
            sendJSON(ws, {
              type: "debug",
              messageType: "error",
              message: String(error),
              orchestratorId: parsed.orchestratorId,
              timestamp: Date.now()
            });
            throw error;
          }
          break;

        default:
          console.warn(chalk.yellow("[WS] Unknown message type:"), parsed.type);
      }

    } catch (error) {
      console.error(chalk.red("[WS] Error:"), error);
      sendJSON(ws, {
        type: "error",
        error: (error as Error).message || String(error),
      });
    }
  });

  ws.on("close", () => {
    console.log(chalk.yellow("[WS] Client disconnected."));
  });
});

process.on("SIGINT", async () => {
  console.log(chalk.yellow("\n\nShutting down..."));
  wss.close(() => {
    console.log(chalk.green("✅ WebSocket server closed"));
  });
  process.exit(0);
});