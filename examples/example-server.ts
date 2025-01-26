import { WebSocketServer, WebSocket } from "ws";
import chalk from "chalk";
import { z } from "zod";

// ---- Import your internal classes and functions here ----
import { LLMClient } from "../packages/core/src/core/llm-client";

import { ChromaVectorDB } from "../packages/core/src/core/vector-db";

import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { defaultCharacter } from "../packages/core/src/core/character";

import { LogLevel } from "../packages/core/src/core/types";
import { ScheduledTaskMongoDb } from "../packages/core/src/core/scheduled-db";

// ------------------------------------------------------
// 1) CREATE DAYDREAMS AGENT
// ------------------------------------------------------
function createDaydreamsAgent() {
    const loglevel = LogLevel.INFO;

    // 1.1. LLM Initialization
    const llmClient = new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest",
        temperature: 0.3,
    });

    // 1.2. Vector memory initialization
    const vectorDb = new ChromaVectorDB("agent_memory", {
        chromaUrl: "http://localhost:8000",
        logLevel: loglevel,
    });

    // 1.3. Room manager initialization
    const roomManager = new RoomManager(vectorDb);

    // 1.4. Initialize processor with default character
    const processor = new MessageProcessor(
        llmClient,
        defaultCharacter,
        loglevel
    );

    // 1.5. Initialize core system
    const orchestrator = new Orchestrator(
        roomManager,
        vectorDb,
        [processor],
        new ScheduledTaskMongoDb(
            "mongodb://localhost:27017",
            "myApp",
            "scheduled_tasks"
        ), // No scheduled tasks for this example
        {
            level: loglevel,
            enableColors: true,
            enableTimestamp: true,
        }
    );

    // 1.6. Register handlers
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
            console.log(`Reply to user ${userId ?? "??"}: ${message}`);
        },
    });

    // Return the orchestrator instance
    return orchestrator;
}

// Create a single "global" instance
const orchestrator = createDaydreamsAgent();

// ------------------------------------------------------
// 2) WEBSOCKET SERVER
// ------------------------------------------------------
const wss = new WebSocketServer({ port: 8080 });
console.log(
    chalk.green("[WS] WebSocket server listening on ws://localhost:8080")
);

function sendJSON(ws: WebSocket, data: unknown) {
    ws.send(JSON.stringify(data));
}

wss.on("connection", (ws) => {
    console.log(chalk.blue("[WS] New client connected."));

    sendJSON(ws, {
        type: "welcome",
        message: "Welcome to Daydreams WebSocket server!",
    });

    ws.on("message", async (rawData) => {
        try {
            const dataString = rawData.toString();
            console.log(chalk.magenta("[WS] Received message:"), dataString);

            const parsed = JSON.parse(dataString);
            const userMessage = parsed.goal;

            if (!userMessage || typeof userMessage !== "string") {
                throw new Error(
                    "Invalid message format. Expected { message: string }"
                );
            }

            // Process the message using the orchestrator
            const outputs = await orchestrator.dispatchToInput("user_chat", {
                content: userMessage,
                userId: "ws-user",
            });

            // Send responses back through WebSocket
            if (outputs && (outputs as any).length > 0) {
                for (const out of outputs as any[]) {
                    if (out.name === "chat_reply") {
                        sendJSON(ws, {
                            type: "response",
                            message: out.data.message,
                        });
                    }
                }
            }
        } catch (error) {
            console.error(chalk.red("[WS] Error processing message:"), error);
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
