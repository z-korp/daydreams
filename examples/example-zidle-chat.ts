import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
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
import { WebSocketServer } from "ws";
import { MongoDb } from "../packages/core/src/core/db/mongo-db";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { defaultCharacter } from "../packages/core/src/core/characters/character";
import { ZIDLE_CONTEXT_CHAT } from "./zidle/zidle-context-chat";
import { ZIDLE_PROVIDER } from "./zidle/zidle-provider"
import { setupBroadcastFunctions } from "./zidle/utils/broadcast";

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
        model: "anthropic/claude-3-5-sonnet-latest", //"openrouter:deepseek/deepseek-r1",
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

    // ------------------------------------------------------
    // 2) WEBSOCKET SERVER
    // ------------------------------------------------------
    const wss = new WebSocketServer({ port: 8080 });
    console.log(
        chalk.green("[WS] WebSocket server listening on ws://localhost:8080")
    );

    const broadcast = setupBroadcastFunctions(wss);

    wss.on("connection", (ws) => {
        console.log(chalk.blue("[WS] New client connected."));
        broadcast.broadcastWelcome("Welcome to the zIdle AI agent WebSocket server!");

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

    const chatDreams = new ChainOfThought(
        llmClient,
        chat_memory,
        {
            worldState: ZIDLE_CONTEXT_CHAT,
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
            broadcast.broadcastUserChat(payload.answer);

            return {
                message: payload.answer
            };
        },
    });

    // Set up event logging
    // Thought process events
    chatDreams.on("step", (step) => {
        if (step.type === "system") {
            console.log("\n💭 System prompt:", step.content);
            broadcast.broadcastSystemMessage(step.content);
        } else {
            console.log("\n🤔 New thought step:", {
                content: step.content,
                tags: step.tags,
            });
        }
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
        broadcast.broadcastActionStart(action.type, action.payload);
    });

    chatDreams.on("action:complete", ({ action, result }) => {
        console.log("\n✅ Action complete:", {
            type: action.type,
            result,
        });
        broadcast.broadcastActionComplete(action.type, result);
    });

    chatDreams.on("action:error", ({ action, error }) => {
        console.log("\n❌ Action failed:", {
            type: action.type,
            error,
        });
        broadcast.broadcastActionError(
            action.type,
            error instanceof Error ? error.message : String(error)
        );
    });

    // Thinking process events
    chatDreams.on("think:start", ({ query }) => {
        console.log("\n🧠 Starting to think about:", query);

        broadcast.broadcastThinkingStart(query);
    });

    chatDreams.on("think:complete", ({ query }) => {
        console.log("\n🎉 Finished thinking about:", query);

        broadcast.broadcastThinkingEnd();
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

        broadcast.broadcastGoalCreated(id, description, priority, horizon.toString());
    });

    chatDreams.on("goal:updated", ({ id, status }) => {
        console.log(chalk.yellow("\n📝 Goal status updated:"), {
            id,
            status: printGoalStatus(status),
        });

        broadcast.broadcastGoalUpdated(id, printGoalStatus(status));
    });

    chatDreams.on("goal:completed", ({ id, result, description }) => {
        console.log(chalk.green("\n✨ Goal completed:"), {
            id,
            result,
            description
        });

        broadcast.broadcastGoalCompleted(id, result, description);
    });

    chatDreams.on("goal:failed", ({ id, error }) => {
        console.log(chalk.red("\n💥 Goal failed:"), {
            id,
            error: error instanceof Error ? error.message : String(error),
        });

        broadcast.broadcastGoalFailed(
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

    while (true) {
        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));
    }
}

main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
});