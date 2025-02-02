import chalk from "chalk";
import { Handler } from "../packages/core/src/core/orchestrator";
import { HandlerRole, LogLevel, ProcessableContent } from "../packages/core/src/core/types";
import { env } from "../packages/core/src/core/env";
import { TwitterClient } from "../packages/core/src/core/io/twitter";
import { defaultCharacter } from "../packages/core/src/core/characters/character";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { MessageProcessor } from "../packages/core/src/core/processors/message-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";

const llmClient = new LLMClient({
    model: "anthropic/claude-3-5-sonnet-latest",
    temperature: 0.3,
});

const messageProcessor = new MasterProcessor(
    llmClient,
    defaultCharacter,
    LogLevel.INFO
);

messageProcessor.addProcessor([
    new MessageProcessor(llmClient, defaultCharacter, LogLevel.INFO),
]);

const handler = new Handler();

const twitter = new TwitterClient(
    {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
    },
);

handler.registerIOHandler({
    name: "twitter_mentions",
    role: HandlerRole.INPUT,
    execute: async () => {
        console.log(chalk.blue("🔍 Checking Twitter mentions..."));
        // Create a static mentions input handler
        const mentionsInput = twitter.createMentionsInput(60000);
        const mentions = await mentionsInput.handler();

        // If no new mentions, return an empty array to skip processing
        if (!mentions || !mentions.length) {
            return [];
        }

        // Filter out mentions that do not have the required non-null properties before mapping
        return mentions
            .filter(
                (mention) =>
                    mention.metadata.tweetId !== undefined &&
                    mention.metadata.conversationId !== undefined &&
                    mention.metadata.userId !== undefined
            )
            .map((mention) => ({
                userId: mention.metadata.userId!,
                threadId: mention.metadata.conversationId!,
                contentId: mention.metadata.tweetId!,
                platformId: "twitter",
                data: mention,
            }));
    },
});
