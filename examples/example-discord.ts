/**
 * Example demonstrating a Discord bot using the Daydreams package.
 * This bot can:
 * - Reply to DMs
 */

import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { DiscordClient } from "../packages/core/src/core/io/discord";
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
    const vectorDb = new ChromaVectorDB("discord_agent", {
        chromaUrl: "http://localhost:8000",
        logLevel: loglevel,
    });

    await vectorDb.purge(); // Clear previous session data

    const roomManager = new RoomManager(vectorDb);

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

    function messageCreate(bot: any, message: any) {
        const isMention =
            message.mentions.users.findKey(
                (user: any) => user.id === bot.id
            ) !== undefined;
        if (isMention) {
            core.dispatchToInput(
                "discord_mention",
                {
                    content: message.content,
                    sentBy: message.author.id,
                    channelId: message.channelId,
                },
                message.author.id
            );
        }
    }

    // Set up Discord client with credentials
    const discord = new DiscordClient(
        {
            discord_token: env.DISCORD_TOKEN,
        },
        loglevel,
        {
            messageCreate,
        }
    );

    // Register input handler for Discord mentions
    core.registerIOHandler({
        name: "discord_mention",
        role: HandlerRole.INPUT,
        handler: async (data: unknown) => {
            const message = data as { content: string; sentBy: string };
            console.log(chalk.blue("🔍 Received Discord mention..."));

            return [message];
        },
        schema: z.object({
            sentBy: z.string(),
            content: z.string(),
            channelId: z.string(),
        }),
    });

    // Register output handler for Discord replies
    core.registerIOHandler({
        name: "discord_reply",
        role: HandlerRole.OUTPUT,
        handler: async (data: unknown) => {
            const messageData = data as {
                content: string;
                channelId: string;
            };
            return discord.createMessageOutput().handler(messageData);
        },
        schema: z
            .object({
                content: z.string(),
                channelId: z
                    .string()
                    .optional()
                    .describe("The channel ID of the message"),
            })
            .describe(
                "If you have been tagged or mentioned in Discord, use this. This is for replying to a message."
            ),
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

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));

        // Clean up resources
        discord.destroy();
        core.removeIOHandler("discord_mention");
        core.removeIOHandler("discord_reply");
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
