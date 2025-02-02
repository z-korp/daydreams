import chalk from "chalk";
import { Dispatcher } from "../packages/core/src/core/orchestrator";
import { HandlerRole, ProcessableContent } from "../packages/core/src/core/types";
import { env } from "../packages/core/src/core/env";
import { TwitterClient } from "../packages/core/src/core/io/twitter";
import { defaultCharacter as character } from "../packages/core/src/core/characters/character";
import { MasterProcessor } from "../packages/core/src/core/processors/master-processor";
import { ResearchQuantProcessor } from "../packages/core/src/core/processors/research-processor";
import { LLMClient } from "../packages/core/src/core/llm-client";

// Chain of Thought...

const twitter = new TwitterClient(
    {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
    },
);

const processor = new MasterProcessor(
    new LLMClient({
        model: "anthropic/claude-3-5-sonnet-latest"
    }),
    character
);

const messageAgent = new Dispatcher();

messageAgent.registerIOHandler({
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

// Add Handler class to the processor
processor.addHandlers(messageAgent);

const decomposeProcessor = new DecomposeObjectiveIntoGoals()
const validateProcessor = new ValidateGoalPrerequisites()
const refineProcessor = new RefineGoal()
const executeProcessor = new ExecuteGoal()

const researchProcessor = new ResearchQuantProcessor(new LLMClient({
    model: "anthropic/claude-3-5-sonnet-latest"
}), character);

processor.addProcessor(researchProcessor.addProcessor(decomposeProcessor).addProcessor(validateProcessor).addProcessor(refineProcessor).addProcessor(executeProcessor));

