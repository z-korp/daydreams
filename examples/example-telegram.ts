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
import { MongoDb } from "../packages/core/src/core/mongo-db";


async function main() {
    const loglevel = LogLevel.DEBUG;

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

    // Set up Telegram bot client with credentials
    const telegram = new TelegramClient(
        {
            bot_token: env.TELEGRAM_TOKEN,
            api_id: parseInt(env.TELEGRAM_API_ID as string),
            api_hash: env.TELEGRAM_API_HASH,
            is_bot: true,
        },
        loglevel,
    );



    // Set up Telegram user client with credentials
    // const telegram = new TelegramClient(
    //     {
    //         bot_token: env.TELEGRAM_TOKEN,
    //         api_id: parseInt(env.TELEGRAM_API_ID as string),
    //         api_hash: env.TELEGRAM_API_HASH,
    //         is_bot: false,
    //     },
    //     loglevel,
    // );



    // Register input handler for getting Telegram messages from channel, chat, etc
    core.registerIOHandler({
        name: "telegram_channel_scraper",
        role: HandlerRole.INPUT,
        handler: async (data: unknown) => {
            const messageData = data as {
                chatId: number;
                limit?: number;
                offset?: number;
            };
            return telegram.createChannelScraper().handler(messageData);
        },
        schema: z
            .object({
                chatId: z
                    .number()
                    .describe("The chat ID to retrieve messages from"),
                limit: z
                    .number()
                    .optional()
                    .describe("The limit for the number of messages to fetch"),
                offset: z
                    .number()
                    .optional()
                    .describe("The offset for the messages to fetch"),
            })
            .describe(
                "This is for getting messages from a chat"
            ),
    });


    // Register output handler for sending Telegram messages from bot or user
    core.registerIOHandler({
        name: "telegram_send_message",
        role: HandlerRole.OUTPUT,
        handler: async (data: unknown) => {
            const messageData = data as {
                content: string;
                chatId: number;
            };
            return telegram.createSendMessageOutput().handler(messageData);
        },
        schema: z
            .object({
                content: z.string(),
                chatId: z
                    .number()
                    .optional()
                    .describe("The chat ID for the message"),
            })
            .describe(
                "This is for sending a message."
            ),
    });

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
        telegram.logout();
        core.removeIOHandler("telegram_get_messages");
        core.removeIOHandler("telegram_send_message");
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