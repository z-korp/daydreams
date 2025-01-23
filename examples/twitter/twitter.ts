import { env } from "../../packages/core/src/core/env";
import { LLMClient } from "../../packages/core/src/core/llm-client";
import { ChainOfThought } from "../../packages/core/src/core/chain-of-thought";
import { ChromaVectorDB } from "../../packages/core/src/core/vector-db";
import { TwitterClient } from "../../packages/core/src/io/twitter";
import { TWITTER_CONTEXT } from "./twitter-context";
import { analysisTweetAction } from "./action/analysis-tweet";
import chalk from "chalk";
import { z } from "zod";

// Utility function from your generator
function logWithTimestamp(type: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARNING', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const colorMap = {
    INFO: chalk.blue,
    ERROR: chalk.red,
    SUCCESS: chalk.green,
    WARNING: chalk.yellow
  };

  console.log(
    `[${timestamp}] ${colorMap[type](`[${type}]`)} ${message}`,
    data ? `\n${JSON.stringify(data, null, 2)}` : ''
  );
}

async function main() {
  // Initialize core components
  const llmClient = new LLMClient({
    model: "deepseek/deepseek-r1",
  });

  const memory = new ChromaVectorDB("twitter_agent");
  //await memory.purge(); // Clear previous session data

  // Initialize Twitter client
  const twitter = new TwitterClient(
    {
      username: env.TWITTER_USERNAME,
      password: env.TWITTER_PASSWORD,
      email: env.TWITTER_EMAIL,
    },
    "ERROR"
  );

  // Initialize the main reasoning engine
  const dreams = new ChainOfThought(llmClient, memory, {
    worldState: TWITTER_CONTEXT,
  });

  // Register tweet generation action
  dreams.registerAction(
    "GENERATE_TWEET",
    async () => {
      const thought = await llmClient.analyze(
        `
        Generate an engaging tweet that is:
        1. Professional and informative
        2. Related to technology or AI
        3. Engaging and conversation-starting
        4. Under 280 characters
        5. Using appropriate hashtags

        Format: Return only the tweet text, no explanations.
        `,
        {
          system: "You are a professional tech influencer. Write engaging tweets about technology and AI.",
          temperature: 0.7
        }
      );

      return JSON.stringify({
        content: thought || '',
        timestamp: new Date().toISOString()
      });
    },
    {
      description: "Generate a new tweet about technology or AI",
      example: JSON.stringify({
        content: "This is a tweet about technology or AI",
        timestamp: new Date().toISOString()
      }),
    },
    
  );

  // Register tweet analysis action
  dreams.registerAction(
    "ANALYZE_TWEET", 
    async (action: typeof analysisTweetAction) => {
        //TODO: recuperer timeline ici
      console.log(chalk.red(action));
      const tweet = action.data.tweet;
      const analysis = await llmClient.analyze(
        `
        Analyze this tweet and provide insights about:
        1. Tone (formal, casual, etc.)
        2. Purpose (inform, engage, promote, etc.)
        3. Key topics or themes
        4. Writing style characteristics
        5. Engagement potential

        Tweet: "${tweet.content}"
        `,
        {
          system: "You are a tweet analyst. Provide concise, structured analysis of tweets.",
          temperature: 0.3
        }
      );

      return JSON.stringify({
        content: tweet.content,
        analysis,
        timestamp: new Date().toISOString()
      });
    },
    {
      description: "Analyze the content and metrics of a tweet",
      example: JSON.stringify({
        content: "This is a tweet about technology or AI",
        analysis: "This is an analysis of the tweet",
        timestamp: new Date().toISOString()
      }),
    }
  );

  // Set up event logging
  dreams.on("think:start", ({ query }) => {
    logWithTimestamp('INFO', "Starting process", { query });
  });

  dreams.on("action:start", (action) => {
    logWithTimestamp('INFO', "Executing action", { type: action.type });
  });

  dreams.on("action:complete", ({ action, result }) => {
    logWithTimestamp('SUCCESS', "Action completed", { type: action.type, result });
  });

  dreams.on("action:error", ({ action, error }) => {
    logWithTimestamp('ERROR', "Action failed", { type: action.type, error });
  });

  // Main interaction loop
  while (true) {
    try {
      const lastTweet = await twitter.createTimelineInput("zKorp_", 5);
      
      if (lastTweet) {
        logWithTimestamp('SUCCESS', "Tweet fetched", lastTweet);
        
        const result = await dreams.think(
          `Analyze this tweet: ${lastTweet}`
        );

        logWithTimestamp('SUCCESS', "Analysis completed", result);
      }

      await new Promise(resolve => setTimeout(resolve, 1800000));

    } catch (error) {
      logWithTimestamp('ERROR', "Error in main loop", error);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}

// Application entry point with error handling
main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
