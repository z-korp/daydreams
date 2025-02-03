/**
 * Example demonstrating a Discord bot using the Daydreams package,
 * updated to use a streaming IOHandler so we can handle real-time
 * Discord messages without manual dispatch calls.
 */

import { Orchestrator } from "../packages/core/src/core/orchestrator";
import { HandlerRole, LogLevel } from "../packages/core/src/core/types";
import { DiscordClient } from "../packages/core/src/core/io/discord";
import { ConversationManager } from "../packages/core/src/core/conversation-manager";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { env } from "../packages/core/src/core/env";
import chalk from "chalk";
import { defaultCharacter } from "../packages/core/src/core/characters/character";
import readline from "readline";
import { MongoDb } from "../packages/core/src/core/db/mongo-db";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { makeFlowLifecycle } from "../packages/core/src/core/life-cycle";
import { z } from "zod";
import { FaucetNetwork, SuiChain, SuiNetwork } from "../packages/core/src/core/chains/sui";

async function main() {
    // Set logging level as you see fit
    const loglevel = LogLevel.DEBUG;

    // Initialize core dependencies
    const vectorDb = new ChromaVectorDB("discord_agent", {
        chromaUrl: "http://localhost:8000",
        logLevel: loglevel,
    });

    // Optional: Purge previous session data if you want a fresh start
    await vectorDb.purge();

    const suiChain = new SuiChain({
        network: env.SUI_NETWORK as SuiNetwork,
        privateKey: env.SUI_PRIVATE_KEY,
    });

    const conversationManager = new ConversationManager(vectorDb);

    const llmClient = new LLMClient({
        model: "openrouter:deepseek/deepseek-r1",
        temperature: 0.3,
    });

    const masterProcessor = new MasterProcessor(
        llmClient,
        defaultCharacter,
        loglevel
    );

    masterProcessor.addProcessor(
        new MessageProcessor(llmClient, defaultCharacter, loglevel)
    );

    // Connect to MongoDB (for scheduled tasks, if you use them)
    const KVDB = new MongoDb(
        "mongodb://localhost:27017",
        "myApp",
        "scheduled_tasks"
    );
    await KVDB.connect();
    console.log(chalk.green("✅ Scheduled task database connected"));

    // Clear any existing tasks if you like
    await KVDB.deleteAll();

    // Create the Orchestrator
    const core = new Orchestrator(
        masterProcessor,
        makeFlowLifecycle(KVDB, conversationManager),
        {
            level: loglevel,
            enableColors: true,
            enableTimestamp: true,
        }
    );

    // Initialize the Discord client
    const discord = new DiscordClient(
        {
            discord_token: env.DISCORD_TOKEN,
            discord_bot_name: "DeepLoaf",
        },
        loglevel
    );

    // 1) REGISTER A STREAMING INPUT
    //    This handler sets up a Discord listener. On mention, it
    //    pipes data into Orchestrator via "onData".
    core.registerIOHandler({
        name: "discord_stream",
        role: HandlerRole.INPUT,
        subscribe: (onData) => {
            discord.startMessageStream(onData);
            return () => {
                discord.stopMessageStream();
            };
        },
    });

    core.registerIOHandler({
        name: "SUI_FAUCET",
        role: HandlerRole.ACTION,
        outputSchema: z.object({
            network: z
                .string().describe("The network to request SUI from. This should be taken from the input data. Default is testnet if the user does not provide a valid network"),
            recipient: z.string().describe("The account address to receive SUI. This should be taken from the input data"),
            channelId: z.string().describe("Discord channel ID where the message is supposed to be replied! This should be taken from the input data"),
        }), execute: async (data: unknown) => {
            const { network, recipient, channelId } = data as {
                network: FaucetNetwork,
                recipient: string,
                channelId: string,
            }

            const result = await suiChain.requestSui({ network, recipient });
            return {
                content: `Transaction: ${JSON.stringify(result, null, 2)}`,
                channelId
            };
        }
    });

    core.registerIOHandler({
        name: "BTC_API_CALL",
        role: HandlerRole.ACTION,
        outputSchema: z.object({
            content: z
                .string(),
            channelId: z.string().describe("Discord channel ID where the message is supposed to be replied! This should be taken from the input data"),
        }), execute: async (data: unknown) => {
            const { channelId } = data as { channelId: string };
            const result = await fetch(`https://api.coindesk.com/v1/bpi/currentprice.json`);
            const btcData = await result.json();
            console.log({ btcData: JSON.stringify(btcData, null, 2) })
            return {
                content: `Current BTC data: ${btcData.bpi.USD.rate}`,
                channelId
            }
        }
    });

    // 2) REGISTER AN OUTPUT HANDLER
    //    This allows your Processor to suggest messages that are posted back to Discord

    core.registerIOHandler(discord.createMessageOutput());

    // (Optional) Set up a console readline for manual input, etc.
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log(chalk.cyan("🤖 Bot is now running and monitoring Discord..."));
    console.log(
        chalk.cyan("You can also type messages in this console for debugging.")
    );
    console.log(chalk.cyan('Type "exit" to quit.'));

    // Handle graceful shutdown (Ctrl-C, etc.)
    process.on("SIGINT", async () => {
        console.log(chalk.yellow("\n\nShutting down..."));

        // If we want to stop the streaming IO handler:
        core.removeIOHandler("discord_stream");

        // Also remove any other handlers or do cleanup
        core.removeIOHandler("discord_reply");

        core.removeIOHandler("BTC_API_CALL");
        core.removeIOHandler("SUI_FAUCET");
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
