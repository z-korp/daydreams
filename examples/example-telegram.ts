import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { TelegramClient } from "../packages/core/src/core/io/telegram";
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
import { MongoDb } from "../packages/core/src/core/db/mongo-db";
import { Consciousness } from "../packages/core/src/core/consciousness";
import { SchedulerService } from "../packages/core/src/core/schedule-service";
import { Logger } from "../packages/core/src/core/logger";


async function main() {
    const loglevel = LogLevel.DEBUG;

    // Ensure startup chat ID is set
    if (!env.TELEGRAM_STARTUP_CHAT_ID) {
        console.warn(chalk.yellow("⚠️ No TELEGRAM_STARTUP_CHAT_ID set - startup message will be skipped"));
    }

    // Initialize core dependencies
    const vectorDb = new ChromaVectorDB("telegram_agent", {
        chromaUrl: "http://localhost:8000",
        logLevel: loglevel,
    });

    await vectorDb.purge(); // Clear previous session data

    const roomManager = new RoomManager(vectorDb);

    const llmClient = new LLMClient({
        // model: "openrouter:deepseek/deepseek-r1", // Using a supported model
        model: "openrouter:deepseek/deepseek-r1-distill-llama-70b",
        temperature: 0.3,
    });

    // Initialize processor with default character personality
    const processor = new MessageProcessor(
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

    // Initialize core system
    const orchestrator = new Orchestrator(
        roomManager,
        vectorDb,
        processor,
        scheduledTaskDb,
        {
            level: loglevel,
            enableColors: true,
            enableTimestamp: true,
        }
    );

    const scheduler = new SchedulerService(
        {
            logger: new Logger({
                level: loglevel,
                enableColors: true,
                enableTimestamp: true,
            }),
            orchestratorDb: scheduledTaskDb,
            roomManager: roomManager,
            vectorDb: vectorDb,
        },
        orchestrator,
        10000
    );

    scheduler.start();

    // Set up Telegram user client with credentials
    const telegram = new TelegramClient(
        {
            session: env.TELEGRAM_USER_SESSION,
            bot_token: env.TELEGRAM_TOKEN,
            api_id: parseInt(env.TELEGRAM_API_ID as string),
            api_hash: env.TELEGRAM_API_HASH,
            is_bot: false,
        },
        loglevel,
    );

    // Wait for login to complete before setting up handlers
    await telegram.initialize();

    // Register handlers after successful login
    orchestrator.registerIOHandler({
        name: "telegram_channel_scraper",
        role: HandlerRole.INPUT,
        execute: async (data: unknown) => {
            console.log(chalk.green("🤖 Telegram channel scraper registered"));
            const messageData = data as {
                chatId: number;
                limit?: number;
                offset?: number;
            };
            return telegram.createPeriodicChannelScraper([messageData.chatId]).handler(messageData);
        }
    });

    orchestrator.registerIOHandler({
        name: "telegram_send_message",
        role: HandlerRole.OUTPUT,
        execute: async (data: unknown) => {
            const messageData = data as {
                content: string;
                chatId: number;
            };
            return telegram.createSendMessageOutput().handler(messageData);
        },
        outputSchema: z
            .object({
                content: z.string(),
                chatId: z.number().optional().describe("The chat ID for the message"),
            })
            .describe("This is for sending a message."),
    });

    // Initialize autonomous channel scraping
    const consciousness = new Consciousness(llmClient, roomManager, {
        // intervalMs: 300000, // Scrape every 5 minutes
        intervalMs: 5000, // Scrape every 5 seconds
        minConfidence: 0.7,
        logLevel: loglevel,
    });

    // Register consciousness thought handler for autonomous channel scraping
    // orchestrator.registerIOHandler({
    //     name: "consciousness_channel_scrape",
    //     role: HandlerRole.OUTPUT,
    //     execute: async (data: unknown) => {
    //         const messageData = data as {
    //             chatId: number;
    //             limit?: number;
    //         };
    //         return telegram.createChannelScraper().handler(messageData);
    //     },
    //     outputSchema: z
    //         .object({
    //             chatId: z.number().describe("The channel/chat ID to scrape messages from"),
    //             limit: z.number().optional().describe("Maximum number of messages to fetch"),
    //         })
    //         .describe(
    //             "Use this to automatically fetch messages from a Telegram channel or chat"
    //         ),
    // });

    // Register input handler for getting Telegram messages from channel, chat, etc
    await scheduler.scheduleTaskInDb("sleever", "telegram_channel_scraper", {}, 5000);

    // Start consciousness only after login is complete
    await consciousness.start();

    // Set up readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Start the prompt loop
    console.log(chalk.cyan("🤖 Bot is now running and monitoring Telegram..."));
    console.log(chalk.cyan("You can type messages in the console."));
    console.log(chalk.cyan('Type "exit" to quit'));

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));

        // Clean up resources
        await consciousness.stop();
        telegram.logout();
        orchestrator.removeIOHandler("telegram_channel_scraper");
        orchestrator.removeIOHandler("telegram_send_message");
        orchestrator.removeIOHandler("consciousness_channel_scrape");
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