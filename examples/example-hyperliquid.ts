/**
 * Example demonstrating a Hyperliquid bot using the Daydreams package.
 * This bot can:
 * - Place order
 */

import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { HyperliquidClient } from "../packages/core/src/core/io/hyperliquid";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { env } from "../packages/core/src/core/env";
import { LogLevel } from "../packages/core/src/core/types";
import chalk from "chalk";
import { defaultCharacter } from "../packages/core/src/core/character";
import { z } from "zod";
import readline from "readline";
import { MongoDb } from "../packages/core/src/core/mongo-db";

async function main() {
    const loglevel = LogLevel.ERROR;

    // Initialize core dependencies
    const vectorDb = new ChromaVectorDB("hyperliquid_agent", {
        chromaUrl: "http://localhost:8000",
        logLevel: loglevel,
    });

    await vectorDb.purge(); // Clear previous session data

    const roomManager = new RoomManager(vectorDb);
    const userId = "console-user";

    const llmClient = new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest", // Using a known supported model
        temperature: 0.3,
    });

    // Initialize processor with default character personality
    const processor = new MessageProcessor(
        llmClient,
        defaultCharacter,
        loglevel
    );

    // Initialize core system
    const scheduledTaskDb = new MongoDb(
        "mongodb://localhost:27017",
        "myApp",
        "scheduled_tasks"
    );

    await scheduledTaskDb.connect();
    console.log(chalk.green("✅ Scheduled task database connected"));

    await scheduledTaskDb.deleteAll();

    // Initialize core system
    const core = new Orchestrator(
        roomManager,
        vectorDb,
        [processor],
        scheduledTaskDb,
        {
            level: loglevel,
            enableColors: true,
            enableTimestamp: true,
        }
    );

    // Set up Hyperliquid client with credentials
    const hyperliquid = new HyperliquidClient(
        {
            mainAddress: env.HYPERLIQUID_MAIN_ADDRESS,
            walletAddress: env.HYPERLIQUID_WALLET_ADDRESS,
            privateKey: env.HYPERLIQUID_PRIVATE_KEY,
        },
        loglevel
    );

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_place_limit_order_instantorcancel",
        role: HandlerRole.ACTION,
        schema: z.object({
            ticker: z.string(),
            sz: z.number(),
            limit_px: z.number(),
            is_buy: z.boolean(),
        }),
        handler: async (data: unknown) => {
            const message = data as {
                ticker: string;
                sz: number;
                limit_px: number;
                is_buy: boolean;
            };
            console.log(
                chalk.blue(
                    `🔍 ${message.is_buy ? "Buying" : "Selling"} ${message.sz}x${message.ticker} at ${message.limit_px} (total $${message.limit_px * message.sz})...`
                )
            );
            return await hyperliquid.placeLimitOrderInstantOrCancel(
                message.ticker,
                message.sz,
                message.limit_px,
                message.is_buy
            );
        },
    });

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_place_limit_order_goodtilcancel",
        role: HandlerRole.ACTION,
        schema: z.object({
            ticker: z.string(),
            sz: z.number(),
            limit_px: z.number(),
            is_buy: z.boolean(),
        }),
        handler: async (data: unknown) => {
            const message = data as {
                ticker: string;
                sz: number;
                limit_px: number;
                is_buy: boolean;
            };
            console.log(
                chalk.blue(
                    `🔍 ${message.is_buy ? "Buying" : "Selling"} ${message.sz}x${message.ticker} at ${message.limit_px} (total $${message.limit_px * message.sz})...`
                )
            );
            return await hyperliquid.placeLimitOrderGoodTilCancel(
                message.ticker,
                message.sz,
                message.limit_px,
                message.is_buy
            );
        },
    });

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_market_sell_positions",
        role: HandlerRole.ACTION,
        schema: z.object({
            tickers: z.array(z.string()),
        }),
        handler: async (data: unknown) => {
            const message = data as {
                tickers: string[];
            };
            console.log(
                chalk.blue(
                    `🔍 Selling all positions of ${message.tickers.join(", ")}...`
                )
            );
            return await hyperliquid.marketSellPositions(message.tickers);
        },
    });

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_place_market_order",
        role: HandlerRole.ACTION,
        schema: z.object({
            ticker: z.string(),
            sz: z.number(),
            is_buy: z.boolean(),
        }),
        handler: async (data: unknown) => {
            const message = data as {
                ticker: string;
                sz: number;
                is_buy: boolean;
            };
            console.log(chalk.blue(`🔍 Selling all ${message.ticker}...`));
            try {
                return await hyperliquid.placeMarketOrder(
                    message.ticker,
                    message.sz,
                    message.is_buy
                );
            } catch (err) {
                console.error(err);
            }
        },
    });

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_place_market_order_from_total_usdc_amount",
        role: HandlerRole.ACTION,
        schema: z.object({
            ticker: z.string(),
            usdtotalprice: z.number(),
            is_buy: z.boolean(),
        }),
        handler: async (data: unknown) => {
            const message = data as {
                ticker: string;
                usdtotalprice: number;
                is_buy: boolean;
            };
            console.log(
                chalk.blue(
                    `🔍 ${message.is_buy ? "Buying" : "Selling"} all ${message.ticker}...`
                )
            );
            try {
                return await hyperliquid.placeMarketOrderUSD(
                    message.ticker,
                    message.usdtotalprice,
                    message.is_buy
                );
            } catch (err) {
                console.error(err);
            }
        },
    });

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "hyperliquid_get_positions",
        role: HandlerRole.ACTION,
        schema: z.object({
            user: z.string(),
        }),
        handler: async () => {
            console.log(chalk.blue(`🔍 Retrieving all positions...`));
            return await hyperliquid.getPositions();
        },
    });

    core.registerIOHandler({
        name: "user_chat",
        role: HandlerRole.INPUT,
        // This schema describes what a user message looks like
        schema: z.object({
            content: z.string(),
            userId: z.string().optional(),
        }),
        // For "on-demand" input handlers, the `handler()` can be a no-op.
        // We'll call it manually with data, so we don't need an interval.
        handler: async (payload) => {
            // We simply return the payload so the Orchestrator can process it
            return payload;
        },
    });

    core.registerIOHandler({
        name: "ui_chat_reply",
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

            // In a real app, you might push this to a WebSocket, or store it in a DB,
            // or just log it to the console:
            console.log(`Reply to user: ${message}`);

            // No need to return anything if it's a final "output"
        },
    });

    // Set up readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Start the prompt loop
    console.log(chalk.cyan("🤖 Bot is now running and monitoring Discord..."));
    console.log(chalk.cyan("You can type messages in the console."));
    console.log(chalk.cyan('Type "exit" to quit'));

    // Function to prompt for user input
    const promptUser = () => {
        rl.question(
            'Enter your message (or "exit" to quit): ',
            async (userMessage) => {
                if (userMessage.toLowerCase() === "exit") {
                    rl.close();
                    process.exit(0);
                }

                // Dispatch the message
                await core.dispatchToInput(
                    "user_chat",
                    {
                        content: userMessage,
                        userId,
                    },
                    userId
                );

                // Continue prompting
                promptUser();
            }
        );
    };
    promptUser();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));

        // Clean up resources
        core.removeIOHandler("hyperliquid_place_limit_order_instantorcancel");
        core.removeIOHandler("hyperliquid_place_limit_order_goodtilcancel");
        core.removeIOHandler("hyperliquid_market_sell_positions");
        core.removeIOHandler("hyperliquid_place_market_order");
        core.removeIOHandler(
            "hyperliquid_place_market_order_from_total_usdc_amount"
        );
        core.removeIOHandler("hyperliquid_get_positions");
        core.removeIOHandler("user_chat");
        core.removeIOHandler("ui_chat_reply");
        rl.close();

        console.log(chalk.green("✅ Shutdown complete"));
        process.exit(0);
    });
}

// Run the example
main().catch((error) => {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
});
