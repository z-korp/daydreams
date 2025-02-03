import chalk from "chalk";
import { Handler } from "../packages/core/src/core/orchestrator";
import { HandlerRole } from "../packages/core/src/core/types";
import { env } from "../packages/core/src/core/env";
import { TwitterClient } from "../packages/core/src/core/io/twitter";
import { defaultCharacter as character } from "../packages/core/src/core/characters/character";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { ResearchQuantProcessor } from "../packages/core/src/core/processors/research-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { MemoryManagerInterface } from "../packages/core/src/core/new";
import { z } from "zod";

// Chain of Thought...

const twitter = new TwitterClient(
    {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
    },
);

// Holds ref of all Handlers....
const masterHandlers = new Handler();

masterHandlers.registerIOHandler({
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

// I want to give this the actions of calling an API
const processor = new MasterProcessor(
    new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest"
    }),
    character,
    masterHandlers,
    z.object({}),
);

// I want to give this the actions of calling an API
processor.addProcessor(new MasterProcessor(
    new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest"
    }),
    character,
    masterHandlers,
    z.object({}),
));

processor.createStream({
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

await processor.run({
    userId: "123",
    threadId: "456",
    contentId: "789",
    platformId: "twitter",
    data: {
        text: "Hello, world!",
        author: {
            id: "123",
            name: "John Doe",
            username: "john_doe",
        },
    },
});



