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
//interface TweetAnalysis {
//  sentiment: "positive" | "negative" | "neutral";
//  topics: string[];
//  engagement: number;
//}

//interface TwitterAccountAnalysis {
//  handle: string;
//  tweetCount: number;
//  followerCount: number;
//  analyses: TweetAnalysis[];
//  topTopics: string[];
//  overallSentiment: string;
//  engagementRate: number;
//}

// Schema for tweet analysis
//const tweetAnalysisSchema: JSONSchemaType<TweetAnalysis> = {
//  type: "object",
//  properties: {
//    sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
  //  topics: { type: "array", items: { type: "string" } },
//    engagement: { type: "number" },
//  },
//  required: ["sentiment", "topics", "engagement"],
//  additionalProperties: false,
//};

// Define the world state interface
interface TwitterWorldState {
  inputs: {
    timeline: {
      name: string;
      description: string;
      example: any;
    };
  };
  outputs: {
    analysis: {
      name: string;
      description: string;
      example: any;
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
      name: "zkorp_", 
      description: "Fetches and analyzes user's Twitter timeline",
      example: JSON.stringify({
        username: "zkorp_",
        limit: 100,
        includeReplies: true
      }),
    }
  },
  outputs: {
    analysis: {
      name: "analysis",
      description: "Personality analysis based on Twitter activity", 
      example: JSON.stringify({
        communicationStyle: "Direct and professional",
        mainTopics: ["AI", "Technology", "Business"],
        emotionalTendencies: "Neutral to positive", 
        values: ["Innovation", "Education", "Transparency"],
        interactionPatterns: "High engagement with technical content",
        professionalFocus: "AI/ML and Web3",
        personalBrand: "Tech thought leader"
      }),
    }
  },
  context: {
    lastTweetId: undefined,
    analyzedUsers: new Set<string>(),
    personalityProfiles: new Map()
  }
};

// Définir les schémas pour les actions
// interface TwitterAnalysisPayload {
// username: string;
//  tweetLimit: number;
//}

//  const twitterAnalysisSchema: JSONSchemaType<TwitterAnalysisPayload> = {
//   type: "object",
//   properties: {
//     username: { type: "string" },
//     tweetLimit: { type: "number", minimum: 1, maximum: 200 }
//   },
//   required: ["username", "tweetLimit"],
//   additionalProperties: false
//};

async function main() {
  try {
    // Initialize LLM client
    const llmClient = new LLMClient({
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Initialize ChainOfThought with Twitter context
    const dreams = new ChainOfThought(
      llmClient,
      {
        worldState: `{
          "inputs": ${JSON.stringify(worldState.inputs)},
          "outputs": ${JSON.stringify(worldState.outputs)},
          "context": {
            "lastTweetId": null,
            "analyzedUsers": [],
            "personalityProfiles": {}
          }
        }`,
      },
      { chromaUrl: "http://localhost:8000" }
    );

    // Initialize Twitter client
    const twitter = new TwitterClient(
      {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
      },
      LogLevel.DEBUG
    );

    // Register Twitter analysis action
     dreams.registerAction(
      "ANALYZE_TWITTER",
      async (action) => {

        // Fetch timeline data
        const timeline = await twitter.createTimelineInput(worldState.inputs.timeline.name, 10).handler();
        
        // Update last tweet ID if not set
        if (!worldState.context.lastTweetId) {
          worldState.context.lastTweetId = timeline[0]?.metadata?.tweetId;
          return JSON.stringify(timeline);
        }

        // Filter for new tweets only
        const newTweets = timeline.filter(tweet => 
          tweet.metadata?.tweetId && tweet.metadata.tweetId > worldState.context.lastTweetId!
        );

        return JSON.stringify(newTweets);
      },
      {
        description: "Analyze Twitter user's personality from their tweets",
        example: JSON.stringify({
          username: "example_user", 
          tweetLimit: 100
        })
      }
    );

    // Add event handlers for monitoring
    dreams.on("think:start", ({ query }) => {
      console.log(chalk.blue("\n🤔 Analyzing Twitter activity:"), query);
      console.log(chalk.gray("\nDebugging Chain of Thought:"));
      console.log(chalk.gray("- Current context:"), dreams.context);
      console.log(chalk.gray("- Recent steps:"), dreams.stepManager.getSteps().slice(-5));
      console.log(chalk.gray("- Active goals:"), dreams.goalManager.getReadyGoals());
      dreams.goalManager.addGoal(query);
      console.log(chalk.gray("- Action registry:"), Array.from(dreams.actionRegistry.keys()));
    });

    dreams.on("think:error", ({ query, error }) => {
      console.log(chalk.red("\n❌ Analysis failed:"), {
        type: "think",
        query,
        error,
      });
    });

    dreams.on("action:start", (action) => {
      console.log(chalk.yellow("\n🔍 Executing analysis:"), {
        type: action.type,
        payload: action.payload,
      });
    });

    dreams.on("action:complete", ({ action, result }) => {
      console.log(chalk.green("\n✅ Analysis completed:"), {
        type: action.type,
        result,
      });
    });

    dreams.on("action:error", ({ action, error }) => {
      console.log(chalk.red("\n❌ Analysis failed:"), {
        type: action.type,
        error,
      });
    });

    // Start the analysis
    console.log(chalk.cyan('\n👤 Enter Twitter username to analyze:'));
    const userInput = await getCliInput('> ');
    
    if (!userInput.trim()) {
      throw new Error('No username provided');
    }

    console.log(chalk.cyan("\n🤖 Starting Twitter analyzer..."));

    // Initial analysis with more specific prompt
    const result = await dreams.think(
      `Task: Analyze Twitter user ${userInput}'s activity.
      Required steps:
      1. Fetch recent tweets using ANALYZE_TWITTER action
      2. Analyze communication patterns and personality traits
      3. Generate a comprehensive profile
      
      Please follow the exact response format with plan and actions.`
    );

    console.log(chalk.green("\n✨ Initial analysis completed!"));
    console.log("Profile:", result);

    // Continue monitoring for new tweets
    setInterval(async () => {
      await dreams.think(
        `Check for new tweets from ${userInput} and update their personality profile if needed.`
      );
    }, 5 * 60 * 1000); // Check every 5 minutes

  } catch (error) {
    console.error(chalk.red("Fatal error:"), error);
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
