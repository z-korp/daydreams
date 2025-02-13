import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { ZIDLE_CONTEXT } from "./zidle/new-prompt-json/zidle-context";
import { ZIDLE_PROVIDER } from "./zidle/new-prompt-json/zidle-provider";
import { ZIDLE_CONTEXT_CHAT } from "./zidle/new-prompt-json/zidle-context-chat";
import chalk from "chalk";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { z } from "zod";
import { StarknetChain } from "../packages/core/src/core/chains/starknet";
import { fetchGraphQL } from "../packages/core/src/core/providers";
import { env } from "../packages/core/src/core/env";
import readline from "readline";
import {
    GoalStatus,
    HandlerRole,
    LogLevel,
} from "../packages/core/src/core/types";
import { WebSocketServer, WebSocket } from "ws";
import { MongoDb } from "../packages/core/src/core/db/mongo-db";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { ConversationManager } from "../packages/core/src/core/conversation-manager";
import { defaultCharacter } from "../packages/core/src/core/characters/character";

/**
 * Helper function to get user input from CLI
 */
async function getCliInput(prompt: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Helper function to format goal status with colored icons
 */
function printGoalStatus(status: GoalStatus): string {
    const colors: Record<GoalStatus, string> = {
        pending: chalk.yellow("⏳ PENDING"),
        active: chalk.blue("▶️ ACTIVE"),
        completed: chalk.green("✅ COMPLETED"),
        failed: chalk.red("❌ FAILED"),
        ready: chalk.cyan("🎯 READY"),
        blocked: chalk.red("🚫 BLOCKED"),
    };
    return colors[status] || status;
}

async function main() {
    const loglevel = LogLevel.DEBUG;

    // Initialize LLM client
    const llmClient = new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest", //"deepseek/deepseek-r1", //"anthropic/claude-3.5-haiku-20241022:beta"
    });

    const starknetChain = new StarknetChain({
        rpcUrl: env.STARKNET_RPC_URL,
        address: env.STARKNET_ADDRESS,
        privateKey: env.STARKNET_PRIVATE_KEY,
    });

    const memory = new ChromaVectorDB("agent_memory");
    const chat_memory = new ChromaVectorDB("chat_memory");
    await memory.purge(); // Clear previous session data
    await chat_memory.purge(); // Clear previous session data
    const conversationManager = new ConversationManager(memory);

    // Load initial context documents
    /*await memory.storeDocument({
        title: "Game Rules",
        content: ZIDLE_CONTEXT,
        category: "rules",
        tags: ["game-mechanics", "rules"],
        lastUpdated: new Date(),
    });

    await memory.storeDocument({
        title: "Provider Guide",
        content: ZIDLE_PROVIDER,
        category: "actions",
        tags: ["actions", "provider-guide"],
        lastUpdated: new Date(),
    });*/

    await chat_memory.storeDocument({
        title: "Game Rules",
        content: ZIDLE_CONTEXT_CHAT,
        category: "rules",
        tags: ["game-mechanics", "rules"],
        lastUpdated: new Date(),
    });

    await chat_memory.storeDocument({
        title: "Provider Guide",
        content: ZIDLE_PROVIDER,
        category: "actions",
        tags: ["actions", "provider-guide"],
        lastUpdated: new Date(),
    });

    const processor = new MasterProcessor(
        llmClient,
        defaultCharacter,
        loglevel
    );

    const scheduledTaskDb = new MongoDb(
        "mongodb://localhost:27017",
        "myApp",
        "scheduled_tasks"
    );

    await scheduledTaskDb.connect();
    console.log(chalk.green("✅ Scheduled task database connected"));
    await scheduledTaskDb.deleteAll();

    /*const orchestrator = new Orchestrator(
        processor,
        makeFlowLifecycle(scheduledTaskDb, conversationManager),
        {
            level: loglevel,
            enableColors: true,
            enableTimestamp: true,
        }
    );
    orchestrator.registerIOHandler({
        role: HandlerRole.ACTION,
        name: "EXECUTE_READ",
        execute: async (payload: any) => {


            const result = await starknetChain.read(payload);
            return `Read: ${JSON.stringify(result, null, 2)}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe("The address of the contract to read from"),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to use to call, never include slashes or comments"
            ),
    });

    orchestrator.registerIOHandler({
        role: HandlerRole.ACTION,
        name: "EXECUTE_TRANSACTION",
        execute: async (payload: any) => {
            const result = await starknetChain.write(payload);
            return `Transaction: ${JSON.stringify(result, null, 2)}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe(
                        "The address of the contract to execute the transaction on"
                    ),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to execute the transaction, never include slashes or comments"
            ),
    });

    orchestrator.registerIOHandler({
        role: HandlerRole.ACTION,
        name: "GRAPHQL_FETCH",
        execute: async (payload: any) => {
            console.log(
                "Preparing to execute graphql fetch action... " +
                JSON.stringify(payload)
            );
            const shouldProceed = await getCliInput(
                chalk.yellow(
                    "\nProceed with the execute graphql action? (y/n): "
                )
            );
            if (shouldProceed.toLowerCase() !== "y") {
                return "Action aborted by the user.";
            }

            console.log("[GRAPHQL_FETCH handler] data", payload);
            const { query, variables } = payload ?? {};
            const result = await fetchGraphQL(
                env.GRAPHQL_URL + "/graphql",
                query,
                variables
            );
            const resultStr = [
                `query: ${query}`,
                `result: ${JSON.stringify(result, null, 2)}`,
            ].join("\n\n");
            return `GraphQL data fetched successfully: ${resultStr}`;
        },
        outputSchema: z
            .object({
                query: z
                    .string()
                    .describe(
                        `query ZidleMinerModels { zidleMinerModels(where: { token_id: "0x10" }) {totalCount edges { node { resource_type xp } } } }`
                    ),
            })
            .describe(
                "The payload to fetch data from the zIdle GraphQL API, never include slashes or comments"
            ),
    });
    // Enregistrer les handlers avec des schémas simples
    orchestrator.registerIOHandler({
        name: "user_chat",
        role: HandlerRole.INPUT,
        execute: async (payload) => {
            console.log("USER CHAT", payload);
            // Utiliser chatDreams.think au lieu de process
            await chatDreams.think(payload.data.userMessage);
            return payload;
        },
    });

    orchestrator.registerIOHandler({
        name: "chat_reply",
        role: HandlerRole.OUTPUT,
        outputSchema: z.any(),
        execute: async (payload) => {
            const { userId, response } = payload as {
                userId?: string;
                response: string;
            };
            return {
                userId,
                message: response
            };
        },
    });*/

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

    /**
     * Broadcast a message to all connected WebSocket clients
     */
    function broadcastMessage(message: AppMessage) {
        const messageString = JSON.stringify(message);
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(messageString);
            }
        });
    }

    function broadcastUserChat(message: string) {
        const welcomeMsg: UserChatMessage = {
            type: "user_chat",
            message,
            timestamp: "", // Will be filled by createMessage
            emoji: "", // Will be filled by createMessage
        };
        broadcastMessage(createMessage(welcomeMsg));
    }

    /**
     * Broadcast Functions for Each Message Type
     */

    function broadcastWelcome(message: string) {
        const welcomeMsg: WelcomeMessage = {
            type: "welcome",
            message,
            timestamp: "", // Will be filled by createMessage
            emoji: "", // Will be filled by createMessage
        };
        broadcastMessage(createMessage(welcomeMsg));
    }

    function broadcastResponse(message: string) {
        const responseMsg: ResponseMessage = {
            type: "response",
            message,
            timestamp: "",
            emoji: "",
        };
        broadcastMessage(createMessage(responseMsg));
    }

    function broadcastError(error: string) {
        const errorMsg: ErrorMessage = {
            type: "error",
            error,
            timestamp: "",
            emoji: "",
        };
        broadcastMessage(createMessage(errorMsg));
    }

    // Helper to create and broadcast a "thinking_start" message
    function broadcastThinkingStart(message: string) {
        const thinkingStartMsg: ThinkingStartMessage = {
            type: "thinking_start",
            message,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            emoji: "🤔",
        };
        broadcastMessage(thinkingStartMsg);
    }

    // Helper to create and broadcast a "thinking_end" message
    function broadcastThinkingEnd() {
        const thinkingEndMsg: ThinkingEndMessage = {
            type: "thinking_end",
            message: "Agent finished thinking.",
            timestamp: Math.floor(Date.now() / 1000).toString(),
            emoji: "✅",
        };
        broadcastMessage(thinkingEndMsg);
    }

    function broadcastGoalCreated(id: string, description: string, priority: number, horizon: string) {
        const goalCreatedMsg: Omit<GoalCreatedMessage, "timestamp" | "emoji"> =
        {
            type: "goal_created",
            data: {
                id,
                description,
                priority,
                horizon,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(goalCreatedMsg));
    }

    function broadcastGoalUpdated(id: string, status: string) {
        const goalUpdatedMsg: Omit<GoalUpdatedMessage, "timestamp" | "emoji"> =
        {
            type: "goal_updated",
            data: {
                id,
                status,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(goalUpdatedMsg));
    }

    function broadcastGoalCompleted(id: string, result: string, description: string) {
        const goalCompletedMsg: Omit<
            GoalCompletedMessage,
            "timestamp" | "emoji"
        > = {
            type: "goal_completed",
            data: {
                id,
                result,
                description,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(goalCompletedMsg));
    }

    function broadcastGoalFailed(id: string, error: string) {
        const goalFailedMsg: Omit<GoalFailedMessage, "timestamp" | "emoji"> = {
            type: "goal_failed",
            data: {
                id,
                error,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(goalFailedMsg));
    }

    function broadcastActionStart(actionType: string, payload: any) {
        const actionStartMsg: Omit<ActionStartMessage, "timestamp" | "emoji"> =
        {
            type: "action_start",
            data: {
                actionType,
                payload,
            },
        };

        broadcastMessage(createMessage(actionStartMsg));
    }

    function broadcastActionComplete(actionType: string, result: any) {
        const actionCompleteMsg: Omit<
            ActionCompleteMessage,
            "timestamp" | "emoji"
        > = {
            type: "action_complete",
            data: {
                actionType,
                result,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(actionCompleteMsg));
    }

    function broadcastActionError(actionType: string, error: string) {
        const actionErrorMsg: Omit<ActionErrorMessage, "timestamp" | "emoji"> =
        {
            type: "action_error",
            data: {
                actionType,
                error,
                timestamp: Math.floor(Date.now() / 1000).toString(),
            },
        };

        broadcastMessage(createMessage(actionErrorMsg));
    }

    function broadcastSystemMessage(message: string) {
        const systemMsg: SystemMessage = {
            type: "system",
            message,
            timestamp: "",
            emoji: "",
        };
        broadcastMessage(createMessage(systemMsg));
    }

    wss.on("connection", (ws) => {
        console.log(chalk.blue("[WS] New client connected."));
        broadcastWelcome("Welcome to the zIdle AI agent WebSocket server!");

        ws.on("message", async (rawData) => {
            try {
                const dataString = rawData.toString();
                console.log(chalk.magenta("[WS] Received message:"), dataString);

                const parsed = JSON.parse(dataString);
                const userMessage = parsed.goal;

                console.log("userMessage ", dataString);
                console.log("userMessage ", userMessage);
                console.log("user_chat", JSON.stringify(userMessage));

                console.log(chalk.cyan("\n🤔 Planning strategy for answering message..."));

                // Create an objective based on the user message
                const goalText = `Your objective is to answer this user query: "${userMessage} while keeping THE USER INFORMED:  Your number one priority is to provide immediate, clear, and detailed CHAT_REPLY updates at every step of any process."`;
                await chatDreams.decomposeObjectiveIntoGoals(goalText);

                console.log("getAllGoals", chatDreams.goalManager.getAllGoals());

                // Now loop through all goals until there are none left to process.
                const stats = { completed: 0, failed: 0, total: 0 };
                while (true) {
                    // Retrieve current goals from the goal manager.
                    const readyGoals = chatDreams.goalManager.getReadyGoals();
                    const activeGoals = chatDreams.goalManager
                        .getGoalsByHorizon("short")
                        .filter((g) => g.status === "active");
                    const pendingGoals = chatDreams.goalManager
                        .getGoalsByHorizon("short")
                        .filter((g) => g.status === "pending");

                    console.log(chalk.cyan("\n📊 Current Chat Progress:"));
                    console.log(`Ready goals: ${readyGoals.length}`);
                    console.log(`Active goals: ${activeGoals.length}`);
                    console.log(`Pending goals: ${pendingGoals.length}`);
                    console.log(`Completed: ${stats.completed}`);
                    console.log(`Failed: ${stats.failed}`);

                    // If no goals remain (all are completed) then break.
                    if (
                        readyGoals.length === 0 &&
                        activeGoals.length === 0 &&
                        pendingGoals.length === 0
                    ) {
                        console.log(chalk.green("\n✨ All chat goals completed!"));
                        break;
                    }

                    // If there are pending goals but none ready or active, show details and break.
                    if (readyGoals.length === 0 && activeGoals.length === 0) {
                        console.log(
                            chalk.yellow(
                                "\n⚠️ No ready or active chat goals, but some goals are pending:"
                            )
                        );
                        pendingGoals.forEach((goal) => {
                            const blockingGoals = chatDreams.goalManager.getBlockingGoals(goal.id);
                            console.log(chalk.yellow(`\n📌 Pending Chat Goal: ${goal.description}`));
                            console.log(chalk.yellow(`   Blocked by: ${blockingGoals.length} goals`));
                            blockingGoals.forEach((blocking) => {
                                console.log(
                                    chalk.yellow(`   - ${blocking.description} (${blocking.status})`)
                                );
                            });
                        });
                        break;
                    }

                    // Process the highest priority goal.
                    try {
                        await chatDreams.processHighestPriorityGoal();
                        stats.completed++;
                    } catch (error) {
                        console.error(chalk.red("\n❌ Chat goal execution failed:"), error);
                        stats.failed++;
                    }
                    stats.total++;
                }
            } catch (error) {
                console.error(chalk.red("[WS] Error processing message:"), error);
                ws.send(JSON.stringify({
                    type: "error",
                    error: (error as Error).message || String(error),
                }));
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

    // Créer deux ChainOfThought distincts qui partagent la même mémoire
    const actionDreams = new ChainOfThought(
        llmClient,
        memory,
        {
            worldState: ZIDLE_CONTEXT,
            providerContext: ZIDLE_PROVIDER,
        },
        { logLevel: LogLevel.DEBUG }
    );

    const chatDreams = new ChainOfThought(
        llmClient,
        chat_memory,
        {
            worldState: ZIDLE_CONTEXT,
            providerContext: ZIDLE_PROVIDER,
        },
        { logLevel: LogLevel.DEBUG }
    );

    chatDreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "EXECUTE_READ",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute read action... " +
                JSON.stringify(action.payload)
            );

            const result = await starknetChain.read(action.payload);
            return `[EXECUTE_READ] ${action.context}: ${JSON.stringify(result, null, 2)}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe("The address of the contract to read from"),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to use to call, never include slashes or comments"
            ),
    });

    chatDreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "EXECUTE_TRANSACTION",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute transaction action... " +
                JSON.stringify(action.payload)
            );


            const result = await starknetChain.write(action.payload);
            console.log("result", result);
            console.log("result.value", result.value);
            console.log("result", JSON.stringify(result));
            if (result === undefined) {
                return `[EXECUTE_TRANSACTION] ${action.context}. FAILED`;
            }
            return `[EXECUTE_TRANSACTION] ${action.context}. STATUS: ${result.statusReceipt}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe(
                        "The address of the contract to execute the transaction on"
                    ),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to execute the transaction, never include slashes or comments"
            ),
    });

    chatDreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "GRAPHQL_FETCH",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute graphql fetch action... " +
                JSON.stringify(action.payload)
            );


            console.log("[GRAPHQL_FETCH handler] action", action);
            const { query, variables } = action.payload ?? {};
            const result = await fetchGraphQL(
                env.GRAPHQL_URL + "/graphql",
                query,
                variables
            );
            const resultStr = [
                `query: ${query}`,
                `result: ${JSON.stringify(result, null, 2)}`,
            ].join("\n\n");
            return `[GRAPHQL_FETCH] ${action.context}: ${resultStr}`;
        },
        outputSchema: z
            .object({
                query: z
                    .string()
                    .describe(
                        `query ZidleMinerModels { zidleMinerModels(where: { token_id: "0x10" }) {totalCount edges { node { resource_type xp } } } }`
                    ),
            })
            .describe(
                "The payload to fetch data from the zIdle GraphQL API, never include slashes or comments"
            ),
    });

    chatDreams.registerOutput({
        role: HandlerRole.OUTPUT,
        name: "CHAT_REPLY",
        outputSchema: z
            .object({
                answer: z
                    .string()
                    .describe(
                        `Answer to the user`
                    ),
            })
            .describe(
                "The answer to the user"
            ),
        execute: async (ret) => {
            console.log("ret: ", ret)
            const { payload } = ret as {
                payload: { answer: string };
            };
            broadcastUserChat(payload.answer);

            return {
                message: payload.answer
            };
        },
    });

    actionDreams.on("step", (step) => {
        if (step.type === "system") {
            console.log("\n💭 Action System:", step.content);
        } else {
            console.log("\n🤔 Action Thought:", {
                content: step.content,
                tags: step.tags,
            });
        }
    });

    // Initialize the main reasoning engine
    const dreams = new ChainOfThought(
        llmClient,
        memory,
        {
            worldState: ZIDLE_CONTEXT,
            providerContext: ZIDLE_PROVIDER,
        },
        { logLevel: LogLevel.DEBUG }
    );

    dreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "EXECUTE_READ",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute read action... " +
                JSON.stringify(action.payload)
            );
            const shouldProceed = await getCliInput(
                chalk.yellow("\nProceed with the read action? (y/n): ")
            );
            if (shouldProceed.toLowerCase() !== "y") {
                return "Action aborted by the user.";
            }

            const result = await starknetChain.read(action.payload);
            return `[EXECUTE_READ] ${action.context}: ${JSON.stringify(result, null, 2)}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe("The address of the contract to read from"),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to use to call, never include slashes or comments"
            ),
    });

    dreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "EXECUTE_TRANSACTION",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute transaction action... " +
                JSON.stringify(action.payload)
            );
            const shouldProceed = await getCliInput(
                chalk.yellow(
                    "\nProceed with the execute transaction action? (y/n): "
                )
            );
            if (shouldProceed.toLowerCase() !== "y") {
                return "Action aborted by the user.";
            }

            const result = await starknetChain.write(action.payload);
            console.log("result", result);
            console.log("result.value", result.value);
            console.log("result", JSON.stringify(result));
            if (result === undefined) {
                return `[EXECUTE_TRANSACTION] ${action.context}. FAILED`;
            }
            return `[EXECUTE_TRANSACTION] ${action.context}. STATUS: ${result.statusReceipt}`;
        },
        outputSchema: z
            .object({
                contractAddress: z
                    .string()
                    .describe(
                        "The address of the contract to execute the transaction on"
                    ),
                entrypoint: z
                    .string()
                    .describe("The entrypoint to call on the contract"),
                calldata: z
                    .array(z.union([z.number(), z.string()]))
                    .describe("The calldata to pass to the entrypoint"),
            })
            .describe(
                "The payload to execute the transaction, never include slashes or comments"
            ),
    });

    dreams.registerOutput({
        role: HandlerRole.ACTION,
        name: "GRAPHQL_FETCH",
        execute: async (action: any) => {
            console.log(
                "Preparing to execute graphql fetch action... " +
                JSON.stringify(action.payload)
            );
            const shouldProceed = await getCliInput(
                chalk.yellow(
                    "\nProceed with the execute graphql action? (y/n): "
                )
            );
            if (shouldProceed.toLowerCase() !== "y") {
                return "Action aborted by the user.";
            }

            console.log("[GRAPHQL_FETCH handler] action", action);
            const { query, variables } = action.payload ?? {};
            const result = await fetchGraphQL(
                env.GRAPHQL_URL + "/graphql",
                query,
                variables
            );
            const resultStr = [
                `query: ${query}`,
                `result: ${JSON.stringify(result, null, 2)}`,
            ].join("\n\n");
            return `[GRAPHQL_FETCH] ${action.context}: ${resultStr}`;
        },
        outputSchema: z
            .object({
                query: z
                    .string()
                    .describe(
                        `query ZidleMinerModels { zidleMinerModels(where: { token_id: "0x10" }) {totalCount edges { node { resource_type xp } } } }`
                    ),
            })
            .describe(
                "The payload to fetch data from the zIdle GraphQL API, never include slashes or comments"
            ),
    });

    // Set up event logging
    // Thought process events
    chatDreams.on("step", (step) => {
        if (step.type === "system") {
            console.log("\n💭 System prompt:", step.content);
            broadcastSystemMessage(step.content);
        } else {
            console.log("\n🤔 New thought step:", {
                content: step.content,
                tags: step.tags,
            });
        }

        sendJSON;
    });

    // Uncomment to log token usage
    // llmClient.on("trace:tokens", ({ input, output }) => {
    //   console.log("\n💡 Tokens used:", { input, output });
    // });

    // Action execution events
    chatDreams.on("action:start", (action) => {
        console.log("\n🎬 Starting action:", {
            type: action.type,
            payload: action.payload,
        });
        broadcastActionStart(action.type, action.payload);
    });

    chatDreams.on("action:complete", ({ action, result }) => {
        console.log("\n✅ Action complete:", {
            type: action.type,
            result,
        });
        broadcastActionComplete(action.type, result);
    });

    chatDreams.on("action:error", ({ action, error }) => {
        console.log("\n❌ Action failed:", {
            type: action.type,
            error,
        });
        broadcastActionError(
            action.type,
            error instanceof Error ? error.message : String(error)
        );
    });

    // Thinking process events
    chatDreams.on("think:start", ({ query }) => {
        console.log("\n🧠 Starting to think about:", query);

        broadcastThinkingStart(query);
    });

    chatDreams.on("think:complete", ({ query }) => {
        console.log("\n🎉 Finished thinking about:", query);

        broadcastThinkingEnd();
    });

    chatDreams.on("think:timeout", ({ query }) => {
        console.log("\n⏰ Thinking timed out for:", query);
    });

    chatDreams.on("think:error", ({ query, error }) => {
        console.log("\n💥 Error while thinking about:", query, error);
    });

    // Goal management events
    chatDreams.on("goal:created", ({ id, description, priority, horizon }) => {
        console.log(chalk.cyan("\n🎯 New goal created:"), {
            id,
            description,
        });

        broadcastGoalCreated(id, description, priority, horizon.toString());
    });

    chatDreams.on("goal:updated", ({ id, status }) => {
        console.log(chalk.yellow("\n📝 Goal status updated:"), {
            id,
            status: printGoalStatus(status),
        });

        broadcastGoalUpdated(id, printGoalStatus(status));
    });

    chatDreams.on("goal:completed", ({ id, result, description }) => {
        console.log(chalk.green("\n✨ Goal completed:"), {
            id,
            result,
            description
        });

        broadcastGoalCompleted(id, result, description);
    });

    chatDreams.on("goal:failed", ({ id, error }) => {
        console.log(chalk.red("\n💥 Goal failed:"), {
            id,
            error: error instanceof Error ? error.message : String(error),
        });

        broadcastGoalFailed(
            id,
            error instanceof Error ? error.message : String(error)
        );
    });

    // Memory management events
    chatDreams.on("memory:experience_stored", ({ experience }) => {
        console.log(chalk.blue("\n💾 New experience stored:"), {
            action: experience.action,
            outcome: experience.outcome,
            importance: experience.importance,
            timestamp: experience.timestamp,
        });

        if (experience.emotions?.length) {
            console.log(
                chalk.blue("😊 Emotional context:"),
                experience.emotions.join(", ")
            );
        }
    });

    chatDreams.on("memory:knowledge_stored", ({ document }) => {
        console.log(chalk.magenta("\n📚 New knowledge documented:"), {
            title: document.title,
            category: document.category,
            tags: document.tags,
            lastUpdated: document.lastUpdated,
        });
        console.log(chalk.magenta("📝 Content:"), document.content);
    });

    chatDreams.on("memory:experience_retrieved", ({ experiences }) => {
        console.log(chalk.yellow("\n🔍 Relevant past experiences found:"));
        experiences.forEach((exp, index) => {
            console.log(chalk.yellow(`\n${index + 1}. Previous Experience:`));
            console.log(`   Action: ${exp.action}`);
            console.log(`   Outcome: ${exp.outcome}`);
            console.log(`   Importance: ${exp.importance || "N/A"}`);
            if (exp.emotions?.length) {
                console.log(`   Emotions: ${exp.emotions.join(", ")}`);
            }
        });
    });

    chatDreams.on("memory:knowledge_retrieved", ({ documents }) => {
        console.log(chalk.green("\n📖 Relevant knowledge retrieved:"));
        documents.forEach((doc, index) => {
            console.log(chalk.green(`\n${index + 1}. Knowledge Entry:`));
            console.log(`   Title: ${doc.title}`);
            console.log(`   Category: ${doc.category}`);
            console.log(`   Tags: ${doc.tags.join(", ")}`);
            console.log(`   Content: ${doc.content}`);
        });
    });

    // Handle shutdown
    process.on("SIGINT", async () => {
        console.log(chalk.yellow("\nShutting down zIdle AI agent..."));
        process.exit(0);
    });

    // Main interaction loop
    const main_goal =
        "Achieve the 3 goals as fast as possible";
    while (true) {
        // Add a 2 minute delay
        console.log(chalk.yellow("\n⏳ Waiting for 2 minutes..."));
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
        console.log(chalk.green("✅ Wait complete"));
        continue;
        try {
            // Plan and execute goals
            console.log(chalk.cyan("\n🤔 Planning strategy for goal..."));
            await dreams.decomposeObjectiveIntoGoals(main_goal);

            console.log(chalk.cyan("\n🎯 Executing goals..."));

            const stats = {
                completed: 0,
                failed: 0,
                total: 0,
            };

            // Execute goals until completion
            while (true) {
                console.log("getAllGoals ", dreams.goalManager.getAllGoals());
                console.log("getAllGoals ", dreams.goalManager.getAllGoals());
                const readyGoals = dreams.goalManager.getReadyGoals();
                const activeGoals = dreams.goalManager
                    .getGoalsByHorizon("short")
                    .filter((g) => g.status === "active");
                const pendingGoals = dreams.goalManager
                    .getGoalsByHorizon("short")
                    .filter((g) => g.status === "pending");

                // Status update
                console.log(chalk.cyan("\n📊 Current Progress:"));
                console.log(`Ready goals: ${readyGoals.length}`);
                console.log(`Active goals: ${activeGoals.length}`);
                console.log(`Pending goals: ${pendingGoals.length}`);
                console.log(`Completed: ${stats.completed}`);
                console.log(`Failed: ${stats.failed}`);

                // Check if all goals are complete
                if (
                    readyGoals.length === 0 &&
                    activeGoals.length === 0 &&
                    pendingGoals.length === 0
                ) {
                    console.log(chalk.green("\n✨ All goals completed!"));
                    break;
                }

                // Handle blocked goals
                if (readyGoals.length === 0 && activeGoals.length === 0) {
                    console.log(
                        chalk.yellow(
                            "\n⚠️ No ready or active goals, but some goals are pending:"
                        )
                    );
                    pendingGoals.forEach((goal) => {
                        const blockingGoals =
                            dreams.goalManager.getBlockingGoals(goal.id);
                        console.log(
                            chalk.yellow(
                                `\n📌 Pending Goal: ${goal.description}`
                            )
                        );
                        console.log(
                            chalk.yellow(
                                `   Blocked by: ${blockingGoals.length} goals`
                            )
                        );
                        blockingGoals.forEach((blocking) => {
                            console.log(
                                chalk.yellow(
                                    `   - ${blocking.description} (${blocking.status})`
                                )
                            );
                        });
                    });
                    break;
                }

                // Execute next goal
                try {
                    await dreams.processHighestPriorityGoal();
                    stats.completed++;
                } catch (error) {
                    console.error(
                        chalk.red("\n❌ Goal execution failed:"),
                        error
                    );
                    stats.failed++;

                    // Ask to continue
                    const shouldContinue = await getCliInput(
                        chalk.yellow(
                            "\nContinue executing remaining goals? (y/n): "
                        )
                    );

                    if (shouldContinue.toLowerCase() !== "y") {
                        console.log(chalk.yellow("Stopping goal execution."));
                        break;
                    }
                }

                stats.total++;
            }

            // Learning summary
            console.log(chalk.cyan("\n📊 Learning Summary:"));

            const recentExperiences = await dreams.memory.getRecentEpisodes(5);
            console.log(chalk.blue("\n🔄 Recent Experiences:"));
            recentExperiences.forEach((exp, index) => {
                console.log(chalk.blue(`\n${index + 1}. Experience:`));
                console.log(`   Action: ${exp.action}`);
                console.log(`   Outcome: ${exp.outcome}`);
                console.log(`   Importance: ${exp.importance || "N/A"}`);
            });

            const relevantDocs = await dreams.memory.findSimilarDocuments(
                main_goal,
                3
            );
            console.log(chalk.magenta("\n📚 Accumulated Knowledge:"));
            relevantDocs.forEach((doc, index) => {
                console.log(chalk.magenta(`\n${index + 1}. Knowledge Entry:`));
                console.log(`   Title: ${doc.title}`);
                console.log(`   Category: ${doc.category}`);
                console.log(`   Tags: ${doc.tags.join(", ")}`);
            });

            // Final execution summary
            console.log(chalk.cyan("\n📊 Final Execution Summary:"));
            console.log(chalk.green(`✅ Completed Goals: ${stats.completed}`));
            console.log(chalk.red(`❌ Failed Goals: ${stats.failed}`));
            console.log(
                chalk.blue(
                    `📈 Success Rate: ${Math.round(
                        (stats.completed / stats.total) * 100
                    )}%`
                )
            );
            console.log(
                chalk.yellow(
                    `🧠 Learning Progress: ${recentExperiences.length} new experiences, ${relevantDocs.length} relevant knowledge entries`
                )
            );
        } catch (error) {
            console.error(chalk.red("Error processing goal:"), error);
        }
    }
}

main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
});

// // src/types/messages.ts

export type MessageType =
    | "welcome"
    | "response"
    | "error"
    | "goal_created"
    | "goal_updated"
    | "goal_completed"
    | "goal_failed"
    | "action_start"
    | "action_complete"
    | "action_error"
    | "system"
    | "thinking_start"
    | "thinking_end"
    | "user_chat";

export interface BaseMessage {
    type: MessageType;
    timestamp: string; // ISO string
    emoji?: string;
}

export interface UserChatMessage extends BaseMessage {
    type: "user_chat";
    message: string;
}

export interface ThinkingStartMessage extends BaseMessage {
    type: "thinking_start";
    message: string;
}

export interface ThinkingEndMessage extends BaseMessage {
    type: "thinking_end";
    message: string;
}

export interface WelcomeMessage extends BaseMessage {
    type: "welcome";
    message: string;
}

export interface ResponseMessage extends BaseMessage {
    type: "response";
    message: string;
}

export interface ErrorMessage extends BaseMessage {
    type: "error";
    error: string;
}

export interface GoalCreatedMessage extends BaseMessage {
    type: "goal_created";
    data: {
        id: string;
        description: string;
        timestamp: string;
        priority: number;
        horizon: string;
    };
}

export interface GoalUpdatedMessage extends BaseMessage {
    type: "goal_updated";
    data: {
        id: string;
        status: string; // Use enums if possible
        timestamp: string;
    };
}

export interface GoalCompletedMessage extends BaseMessage {
    type: "goal_completed";
    data: {
        id: string;
        result: string;
        description: string;
        timestamp: string;
    };
}

export interface GoalFailedMessage extends BaseMessage {
    type: "goal_failed";
    data: {
        id: string;
        error: string;
        timestamp: string;
    };
}

export interface ActionStartMessage extends BaseMessage {
    type: "action_start";
    data: {
        actionType: string;
        payload: any; // Define more specific types if possible
    };
}

export interface ActionCompleteMessage extends BaseMessage {
    type: "action_complete";
    data: {
        actionType: string;
        result: any;
        timestamp: string;
    };
}

export interface ActionErrorMessage extends BaseMessage {
    type: "action_error";
    data: {
        actionType: string;
        error: string;
        timestamp: string;
    };
}

export interface SystemMessage extends BaseMessage {
    type: "system";
    message: string;
}

// Union Type for All Messages
export type AppMessage =
    | WelcomeMessage
    | ResponseMessage
    | ErrorMessage
    | GoalCreatedMessage
    | GoalUpdatedMessage
    | GoalCompletedMessage
    | GoalFailedMessage
    | ActionStartMessage
    | ActionCompleteMessage
    | ActionErrorMessage
    | SystemMessage
    | ThinkingStartMessage
    | ThinkingEndMessage
    | UserChatMessage;

const emojiMap: Record<MessageType, string> = {
    welcome: "👋",
    response: "💬",
    error: "❌",
    goal_created: "🎯",
    goal_updated: "📝",
    goal_completed: "✅",
    goal_failed: "❌",
    action_start: "🚀",
    action_complete: "✅",
    action_error: "❌",
    system: "🛠️",
    user_chat: "",
    thinking_end: "✅",
    thinking_start: "💬",
};

export function createMessage<M extends BaseMessage>(
    message: Omit<M, "timestamp" | "emoji">
): M {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const emoji = emojiMap[message.type];

    return {
        ...message,
        timestamp,
        emoji,
    } as M;
}
