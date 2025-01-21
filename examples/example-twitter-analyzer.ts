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
interface TwitterAnalysisPayload {
  username: string;
  tweetLimit: number;
}

const twitterAnalysisSchema: JSONSchemaType<TwitterAnalysisPayload> = {
 type: "object",
 properties: {
   username: { type: "string" },
   tweetLimit: { type: "number", minimum: 1, maximum: 200 }
 },
 required: ["username", "tweetLimit"],
 additionalProperties: false
};

interface TwitterAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  topics: string[];
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  mainThemes: string[];
  style: {
    tone: string;
    formality: string;
    language: string[];
  };
  patterns: {
    postingFrequency?: string;
    commonHashtags: string[];
    mentionedUsers: string[];
    mediaUsage: string;
  };
}

async function analyzeTweets(llmClient: LLMClient, tweets: any[]) {
  const prompt = `
    Analyze these tweets and provide insights about:
    1. Overall sentiment and tone
    2. Main topics and themes
    3. Writing style and language use
    4. Engagement patterns
    5. Content strategy observations
    
    Tweets to analyze:
    ${JSON.stringify(tweets, null, 2)}
    
    Provide your analysis in a structured format.
  `;

  const analysis = await llmClient.complete(prompt);
  return analysis;
}

async function main() {
  try {
    // Initialize clients
    const llmClient = new LLMClient({
      provider: "anthropic",
      apiKey: env.ANTHROPIC_API_KEY,
    });

    const twitter = new TwitterClient(
      {
        username: env.TWITTER_USERNAME,
        password: env.TWITTER_PASSWORD,
        email: env.TWITTER_EMAIL,
      },
      LogLevel.DEBUG
    );

    const vectorDb = new ChromaVectorDB("twitter_analysis", {
      chromaUrl: "http://localhost:8000",
      logLevel: LogLevel.DEBUG,
    });

    console.log(chalk.cyan("🔍 Starting Twitter Analysis..."));

    // Fetch tweets
    const tweets = await twitter.createTimelineInput().handler();
    console.log(chalk.blue(`\nFetched ${tweets.length} tweets`));

    // Analyze tweets
    console.log(chalk.yellow("\n📊 Analyzing tweets..."));
    const analysis = await analyzeTweets(llmClient, tweets);

    // Store analysis in VectorDB
    await vectorDb.store(
      JSON.stringify(analysis),
      {
        type: "twitter_analysis",
        timestamp: new Date().toISOString(),
        tweetCount: tweets.length
      }
    );

    // Print analysis
    console.log(chalk.green("\n✨ Analysis Results:"));
    console.log(analysis);

    // Export results
    const fs = require('fs');
    const exportPath = './twitter_analysis.json';
    fs.writeFileSync(
      exportPath,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        tweets: tweets,
        analysis: analysis
      }, null, 2)
    );
    console.log(chalk.green(`\n✅ Analysis exported to ${exportPath}`));

  } catch (error) {
    console.error(chalk.red("\n❌ Error:"), error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGINT", () => {
  console.log(chalk.yellow("\nShutting down analysis..."));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
