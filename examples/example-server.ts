import { WebSocketServer, WebSocket } from "ws";
import chalk from "chalk";
import { z } from "zod";

// ---- Import your internal classes and functions here ----
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { StarknetChain } from "../packages/core/src/core/chains/starknet";
import { env } from "../packages/core/src/core/env";
import { fetchGraphQL } from "../packages/core/src/core/providers";
import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { defaultCharacter } from "../packages/core/src/core/character";

import {
  GoalStatus,
  LogLevel
} from "../packages/core/src/core/types";

// ------------------------------------------------------
// 1) ORCHESTRATOR MANAGER
// ------------------------------------------------------
class OrchestratorManager {
  private orchestrators: Map<string, Orchestrator> = new Map();
  private roomManagers: Map<string, RoomManager> = new Map();

  createOrchestrator(name: string, config = { logLevel: LogLevel.INFO }) {
    console.log(chalk.blue(`[OrchestratorManager] Creating new orchestrator '${name}'`));
    console.log(chalk.gray(`[OrchestratorManager] Config:`, JSON.stringify(config, null, 2)));
    const id = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new instances for this orchestrator
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
      defaultCharacter,
      config.logLevel
    );

    const orchestrator = new Orchestrator(
      roomManager,
      vectorDb,
      [processor],
      null,
      {
        level: config.logLevel,
        enableColors: true,
        enableTimestamp: true,
      }
    );

    // Register handlers
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

// Create global orchestrator manager and default orchestrator
const orchestratorManager = new OrchestratorManager();
const defaultOrch = orchestratorManager.createOrchestrator("Default Orchestrator");

// ------------------------------------------------------
// 2) WEBSOCKET SERVER
// ------------------------------------------------------
const wss = new WebSocketServer({ port: 8080 });
console.log(chalk.green("[WS] WebSocket server listening on ws://localhost:8080"));

function sendJSON(ws: WebSocket, data: unknown) {
  ws.send(JSON.stringify(data));
}

wss.on("connection", (ws) => {
  console.log(chalk.blue("[WS] New client connected."));

  // Send welcome with list of orchestrators
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
        case "create_orchestrator":
          if (!parsed.name) {
            throw new Error("Orchestrator name is required");
          }
          const newOrch = orchestratorManager.createOrchestrator(parsed.name);
          sendJSON(ws, {
            type: "orchestrator_created",
            orchestrator: {
              id: newOrch.id,
              name: newOrch.name,
            },
          });
          break;

        case "list_orchestrators":
          console.log(chalk.blue("[WS] Listing orchestrators"));
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

          console.log(chalk.blue(`[WS] Dispatching message to orchestrator ${parsed.orchestratorId}`));
          
          const outputs = await orchestrator.dispatchToInput("user_chat", {
            content: parsed.message,
            userId: "ws-user",
          });

          console.log(chalk.blue(`[WS] Got outputs:`, outputs));

          if (outputs && Array.isArray(outputs)) {
            for (const out of outputs) {
              if (out.name === "chat_reply") {
                console.log(chalk.blue(`[WS] Sending response:`, out.data.message));
                sendJSON(ws, {
                  type: "response",
                  message: out.data.message,
                  orchestratorId: parsed.orchestratorId
                });
              }
            }
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

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log(chalk.yellow("\n\nShutting down..."));
  
  // Close WebSocket server
  wss.close(() => {
    console.log(chalk.green("✅ WebSocket server closed"));
  });

  process.exit(0);
});
