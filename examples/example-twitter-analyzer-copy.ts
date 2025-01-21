import { env } from "../packages/core/src/core/env";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { TwitterClient } from "../packages/core/src/io/twitter";
import { LogLevel } from "../packages/core/src/types";
import { RoomManager } from "../packages/core/src/core/room-manager";
import chalk from "chalk";
import type { JSONSchemaType } from "ajv"
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";;
import { Processor } from "../packages/core/src/core/processor";
import { defaultCharacter } from "../packages/core/src/core/character";
import { Core } from "../packages/core/src/core/core";

// Define interfaces for our analysis
interface TweetAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  topics: string[];
  engagement: number;
}

interface TwitterAccountAnalysis {
  handle: string;
  tweetCount: number;
  followerCount: number;
  analyses: TweetAnalysis[];
  topTopics: string[];
  overallSentiment: string;
  engagementRate: number;
}

// Schema for tweet analysis
const tweetAnalysisSchema: JSONSchemaType<TweetAnalysis> = {
  type: "object",
  properties: {
    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
    topics: { type: "array", items: { type: "string" } },
    engagement: { type: "number" },
  },
  required: ["sentiment", "topics", "engagement"],
  additionalProperties: false,
};

// Define the world state interface
interface TwitterWorldState {
  inputs: {
    timeline: {
      description: string;
      example: any;
      schema: any;
    };
  };
  outputs: {
    analysis: {
      description: string;
      example: any;
      schema: any;
    };
  };
  context: {
    lastTweetId?: string;
    analyzedUsers: Set<string>;
    personalityProfiles: Map<string, any>;
  };
}

// Create the world state
const worldState: TwitterWorldState = {
  inputs: {
    timeline: {
      description: "Fetches and analyzes user's Twitter timeline",
      example: {
        username: "example_user",
        limit: 100,
        includeReplies: true
      },
      schema: tweetAnalysisSchema
    }
  },
  outputs: {
    analysis: {
      description: "Personality analysis based on Twitter activity",
      example: {
        communicationStyle: "Direct and professional",
        mainTopics: ["AI", "Technology", "Business"],
        emotionalTendencies: "Neutral to positive",
        values: ["Innovation", "Education", "Transparency"],
        interactionPatterns: "High engagement with technical content",
        professionalFocus: "AI/ML and Web3",
        personalBrand: "Tech thought leader"
      },
      schema: {
        type: "object",
        properties: {
          communicationStyle: { type: "string" },
          mainTopics: { type: "array", items: { type: "string" } },
          emotionalTendencies: { type: "string" },
          values: { type: "array", items: { type: "string" } },
          interactionPatterns: { type: "string" },
          professionalFocus: { type: "string" },
          personalBrand: { type: "string" }
        },
        required: ["communicationStyle", "mainTopics", "emotionalTendencies", "values", "interactionPatterns", "professionalFocus", "personalBrand"]
      }
    }
  },
  context: {
    lastTweetId: undefined,
    analyzedUsers: new Set<string>(),
    personalityProfiles: new Map()
  }
};

async function main() {
  try {
    // Initialize core dependencies
    const vectorDb = new ChromaVectorDB("twitter_analyzer", {
      chromaUrl: env.CHROMA_URL,
      logLevel: LogLevel.DEBUG,
    });
    const roomManager = new RoomManager(vectorDb);
    const llmClient = new LLMClient({
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Initialize Twitter client
    const twitter = new TwitterClient(
      {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
      },
      LogLevel.DEBUG
    );

    // Initialize processor with character definition
    const processor = new Processor(
      vectorDb,
      llmClient,
      defaultCharacter,
      LogLevel.DEBUG
    );

    const core = new Core(roomManager, vectorDb, processor, {
        logging: {
          level: LogLevel.DEBUG,
          enableColors: true,
          enableTimestamp: true,
        }
    });

    console.log(chalk.cyan('\n👤 Enter Twitter username to analyze:'));
    const userInput = await getCliInput('> ');
    
    if (!userInput.trim()) {
      throw new Error('No username provided');
    }

    // Register analysis input with world state context
    core.registerInput({
      name: `twitter_analysis_${userInput}`,
      handler: async () => {
        console.log(chalk.blue('🔍 Checking for new tweets...'));
        const timeline = await twitter.createTimelineInput(userInput, 100).handler();
        
        // Use world state to track new tweets
        const newTweets = timeline.filter(tweet => {
          if (!worldState.context.lastTweetId || (tweet.metadata.tweetId && tweet.metadata.tweetId > worldState.context.lastTweetId)) {
            return true;
          }
          return false;
        });

        if (newTweets.length === 0) {
          console.log(chalk.yellow('😴 No new tweets found'));
          console.log(chalk.blue('😴 No new tweets found' +JSON.stringify(worldState)));
          return [];
        }
        // Update world state
        if (newTweets[0]?.metadata?.tweetId) {
          worldState.context.lastTweetId = newTweets[0].metadata.tweetId;
        }
        worldState.context.analyzedUsers.add(userInput);

        console.log(chalk.green(`✅ Found ${newTweets.length} new tweets`));

        // Analyze personality from new tweets
        const personalityPrompt = `Analyze these new tweets to update the personality profile:
${JSON.stringify(newTweets)}

Create a detailed personality analysis including:
1. Communication style
2. Main interests/topics
3. Emotional tendencies
4. Values and beliefs
5. Interaction patterns
6. Professional focus
7. Personal brand

Return as JSON with these exact fields.`;

        const analysis = await llmClient.analyze(personalityPrompt, {
          temperature: 0.7,
          formatResponse: true
        });

        console.log(chalk.cyan('\n📊 New Tweets Analysis:'));
        console.log(JSON.stringify(analysis, null, 2));

        // Store analysis in world state
        worldState.context.personalityProfiles.set(userInput, analysis);

        return newTweets;
      },
      response: worldState.outputs.analysis,
      schema: worldState.inputs.timeline.schema
    });

    // Keep the process running
    console.log(chalk.cyan("🤖 Analyzer is now running..."));
    console.log(chalk.cyan("Press Ctrl+C to stop"));

  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGINT", async () => {
  console.log(chalk.yellow("\nShutting down Twitter analyzer..."));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
}); 

function getCliInput(prompt: string): Promise<string> {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(prompt, (input: string) => {
            readline.close();
            resolve(input);
        });
    });
}
