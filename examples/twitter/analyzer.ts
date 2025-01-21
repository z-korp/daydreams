import { Core } from "../../packages/core/src/core/core";
import { TwitterClient } from "../../packages/core/src/io/twitter";
import { LLMClient } from "../../packages/core/src/core/llm-client";
import { env } from "../../packages/core/src/core/env";
import { LogLevel } from "../../packages/core/src/types";
import { ChainOfThought } from "../../packages/core/src/core/chain-of-thought";
import { TWITTER_CONTEXT } from "./twitter-context";
import chalk from "chalk";

async function main() {
  // Initialize LLM client
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

  // Initialize ChainOfThought with Twitter context
  const dreams = new ChainOfThought(llmClient, {
    worldState: TWITTER_CONTEXT,
  });

  // Register tweet fetching action
  dreams.registerAction(
    "FETCH_TWEETS",
    async (payload: { username: string, count: number }) => {
      console.log(chalk.blue("\n🔍 Fetching tweets from:"), payload.username);
      const tweets = await twitter.getUserTweets(payload.username, payload.count);
      return { tweets };
    },
    {
      description: "Fetch recent tweets from specified user",
      example: JSON.stringify({ username: "example_user", count: 10 }),
    }
  );

  // Register single tweet analysis action
  dreams.registerAction(
    "ANALYZE_TWEET",
    async (payload: { tweet: any }) => {
      console.log(chalk.blue("\n📊 Analyzing tweet:"), payload.tweet.text);
      return {
        id: payload.tweet.id,
        text: payload.tweet.text,
        analysis: {
          length: payload.tweet.text.length,
          hashtags: extractHashtags(payload.tweet.text),
          mentions: extractMentions(payload.tweet.text),
          urls: extractUrls(payload.tweet.text),
          hasEmojis: containsEmojis(payload.tweet.text)
        }
      };
    },
    {
      description: "Analyze single tweet content",
      example: JSON.stringify({ tweet: { id: "123", text: "Example tweet #test" } }),
    }
  );

  // Register analysis action
  dreams.registerAction(
    "ANALYZE_TWEETS",
    async (payload: { tweets: any[] }) => {
      console.log(chalk.blue("\n📊 Analyzing tweets..."));
      return {
        styleAnalysis: {
          avgLength: calculateAverageLength(payload.tweets),
          commonEmojis: extractCommonEmojis(payload.tweets),
          hashtagUsage: analyzeHashtags(payload.tweets),
          tone: "analyzing...", // Will be determined by LLM
        },
        contentAnalysis: {
          topics: "analyzing...", // Will be determined by LLM
          patterns: "analyzing...", // Will be determined by LLM
        },
      };
    },
    {
      description: "Analyze tweet patterns and style",
      example: JSON.stringify({ tweets: ["Example tweet 1", "Example tweet 2"] }),
    }
  );

  // Add event handlers for monitoring
  dreams.on("think:start", ({ query }) => {
    console.log(chalk.blue("\n🤔 Starting analysis:"), query);
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
      result: JSON.stringify(result, null, 2),
    });
  });

  dreams.on("action:error", ({ action, error }) => {
    console.log(chalk.red("\n❌ Analysis failed:"), {
      type: action.type,
      error,
    });
  });

  try {
    console.log(chalk.cyan("\n🤖 Starting Twitter Analyzer..."));

    // Create fetch goal
    dreams.goalManager.addGoal({
      description: "Fetch recent tweets",
      horizon: "short",
      priority: 1,
      dependencies: [],
      status: "pending",
      success_criteria: ["Fetch 10 recent tweets from target account"],
      created_at: new Date().getTime(),
      metadata: {
        action: "FETCH_TWEETS",
        params: {
          username: env.TARGET_TWITTER_ACCOUNT,
          count: 10
        }
      }
    });

    // Create analysis goals after fetch
    dreams.on("goal:completed", async ({ result }) => {
      if (result?.tweets) {
        result.tweets.forEach((tweet: any) => {
          dreams.goalManager.addGoal({
            description: `Analyze tweet ${tweet.id}`,
            horizon: "short",
            priority: 2,
            dependencies: [],
            status: "pending",
            success_criteria: ["Complete tweet analysis"],
            created_at: new Date().getTime(),
            metadata: {
              action: "ANALYZE_TWEET",
              params: { tweet }
            }
          });
        });
      }
    });

    // Execute goals periodically
    setInterval(async () => {
      const readyGoals = dreams.goalManager.getReadyGoals();
      if (readyGoals.length > 0) {
        try {
          await dreams.executeNextGoal();
        } catch (error) {
          console.error(chalk.red("Error executing goal:"), error);
        }
      }
    }, 5000);

  } catch (error) {
    console.error(chalk.red("Fatal error:"), error);
    process.exit(1);
  }
}

// Utility functions for analysis
function calculateAverageLength(tweets: any[]): number {
  return tweets.reduce((acc, tweet) => acc + tweet.text.length, 0) / tweets.length;
}

function extractCommonEmojis(tweets: any[]): string[] {
  // Implement emoji extraction logic
  return [];
}

function analyzeHashtags(tweets: any[]): string[] {
  // Implement hashtag analysis logic
  return [];
}

// Utility functions
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text.match(hashtagRegex) || [];
}

function extractMentions(text: string): string[] {
  const mentionRegex = /@[\w]+/g;
  return text.match(mentionRegex) || [];
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return text.match(urlRegex) || [];
}

function containsEmojis(text: string): boolean {
  const emojiRegex = /[\p{Emoji}]/gu;
  return emojiRegex.test(text);
}

// Run the analyzer
main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});