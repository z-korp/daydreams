/**
 * Example demonstrating a Twitter bot using the Daydreams package.
 * This bot can:
 * - Monitor Twitter mentions and auto-reply
 * - Generate autonomous thoughts and tweet them
 * - Maintain conversation memory using ChromaDB
 * - Process inputs through a character-based personality
 */


import { TwitterClient } from "../packages/core/src/io/twitter";
import { RoomManager } from "../packages/core/src/core/room-manager";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { env } from "../packages/core/src/core/env";
import { LogLevel } from "../packages/core/src/types";
import chalk from "chalk";

import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";

async function main() {
  const loglevel = LogLevel.ERROR;

  // Initialize LLM client
  const llmClient = new LLMClient({
    model: "deepseek/deepseek-r1",
  });
  const memory = new ChromaVectorDB("shared_memory");
  const roomManager = new RoomManager(memory);

  const dreams = new ChainOfThought(
    llmClient,
    memory,
    {
      worldState: "Tu es un bot twitter qui analyse les tweets et les tweets des autres utilisateurs",
    }
  );

  // Add event handlers
  dreams.on("think:start", ({ query }) => {
    console.log(chalk.blue("\n🤔 Analyzing Twitter data:"), query);
  });

  dreams.on("think:complete", ({ result }) => {
    console.log(chalk.green("\n✅ Analysis completed:"), result);
  });

  // Set up Twitter client
  const twitter = new TwitterClient(
    {
      username: env.TWITTER_USERNAME,
      password: env.TWITTER_PASSWORD,
      email: env.TWITTER_EMAIL,
    },
    loglevel
  );

  // Target account to analyze
  const targetAccount = "zkorp_";
  if (!targetAccount) {
    throw new Error("TARGET_TWITTER_ACCOUNT environment variable is required");
  }

  console.log(chalk.cyan(`🔍 Starting analysis of @${targetAccount}...`));

  async function isTwitterAnalyzed(tweetId: string): Promise<boolean> {
    try {
      const results = await memory.findSimilar(tweetId,1,{tweetId:tweetId});
      // Log the document content for debugging
      chalk.bgCyan("\n🔍 Checking each result:");
      
      return results.some((doc) => {
        try {
         
          const storedData = JSON.parse(doc.content); 

          return storedData.metadata.tweetId === tweetId;

        } catch (e) {
          chalk.red("\n❌ Error analyzing document:", e);
          return false;
        }
      });
    } catch (error) {
      console.error("Error checking tweet analysis:", error);
      return false;
    }
  }

  async function saveAnalysis(tweet: any, analysis: any) {
   chalk.bgCyan("\n💾 Saving analysis for tweet:", tweet.metadata.tweetId);
    
    const analysisDoc = {
      id: tweet.metadata.tweetId,
      content: JSON.stringify(analysis),
      metadata: {
        type: "tweet_analysis", 
        timestamp: new Date().toISOString(),
        tweetId: tweet.metadata.tweetId
      }
    };
    
    await memory.store(JSON.stringify(analysisDoc), { tweetId: tweet.metadata.tweetId });
    
    console.log("\n✅ Successfully saved analysis for tweet:", tweet.metadata.tweetId);
  }

  try {
    const timelineData = await twitter.createTimelineInput(targetAccount, 10);
    const tweets = await timelineData.handler();
    console.log(chalk.blue(`📥 Retrieved ${tweets.length} tweets`));

    const unanalyzedTweets = await Promise.all(
      tweets.map(async (tweet) => {
        if (!tweet.metadata.tweetId) return null;
        const isAnalyzed = await isTwitterAnalyzed(tweet.metadata.tweetId);  
        return isAnalyzed ? null : tweet;
      })
    );

    const tweetsToAnalyze = unanalyzedTweets.filter(t => t !== null);
    console.log(chalk.blue(`📊 Processing ${tweetsToAnalyze.length} new tweets`));

    // Analyze each unanalyzed tweet
    for (const tweet of tweetsToAnalyze) {
      console.log(chalk.yellow("\n-------------------"));
    
      console.log(chalk.blue("Tweet Details:"));
      console.log(chalk.cyan("Content:"), tweet.content);
    
      // Basic analysis
      const analysis = {
        length: tweet.content.length,
        hashtags: extractHashtags(tweet.content),
        mentions: extractMentions(tweet.content),
        urls: extractUrls(tweet.content),
        hasEmojis: containsEmojis(tweet.content),
        type: tweet.type,
        timestamp: tweet.metadata.timestamp,
        engagement: {
          likes: tweet.metadata.metrics.likes,
          retweets: tweet.metadata.metrics.retweets,
          replies: tweet.metadata.metrics.replies,
          quotes: tweet.metadata.metrics.retweets
        }
      };

      // LLM Analysis avec plus de contexte
      const llmAnalysis = await llmClient.analyze(
        `
        Analyze this tweet and provide insights about:
        1. Tone (formal, casual, etc.)
        2. Purpose (inform, engage, promote, etc.)
        3. Key topics or themes
        4. Writing style characteristics
        5. Engagement analysis based on metrics

        Tweet: "${tweet.content}"
        Metrics: 
        - Likes: ${tweet.metadata.metrics.likes}
        - Retweets: ${tweet.metadata.metrics.retweets}
        - Replies: ${tweet.metadata.metrics.replies}
        - Quotes: ${tweet.metadata.metrics.retweets}
        Posted at: ${tweet.metadata.timestamp}
        `,
        {
          system: "You are a tweet analyst. Provide concise, structured analysis of tweets.",
          
          
        }
      );

      console.log(chalk.magenta("Deep Analysis:"), llmAnalysis);

      // Save the analysis
      await saveAnalysis(tweet, {
        basicAnalysis: analysis,
        llmAnalysis: llmAnalysis
      });
    }

    // Global analysis
    console.log(chalk.yellow("\n=== Global Analysis ==="));
    const globalStats = {
      totalTweets: tweets.length,
      averageEngagement: calculateAverageEngagement(tweets),
      mostUsedHashtags: getMostUsedHashtags(tweets),
      postingPattern: analyzePostingPattern(tweets)
    };
    console.log(chalk.cyan("Global Stats:"), globalStats);

    console.log(chalk.green("\n✅ Analysis complete!"));

  } catch (error) {
    console.error(chalk.red("Error during analysis:"), error);
    process.exit(1);
  }
}

function calculateAverageEngagement(tweets: any[]): any {
  const totals = tweets.reduce((acc, tweet) => ({
    likes: acc.likes + tweet.metadata.metrics.likes,
    retweets: acc.retweets + tweet.metadata.metrics.retweets,
    replies: acc.replies + tweet.metadata.metrics.replies,
    quotes: acc.quotes + tweet.metadata.metrics.quotes
  }), { likes: 0, retweets: 0, replies: 0, quotes: 0 });

  return {
    avgLikes: totals.likes / tweets.length,
    avgRetweets: totals.retweets / tweets.length,
    avgReplies: totals.replies / tweets.length,
    avgQuotes: totals.quotes / tweets.length
  };
}

function getMostUsedHashtags(tweets: any[]): Record<string, number> {
  const hashtags: Record<string, number> = {};
  tweets.forEach(tweet => {
    extractHashtags(tweet.content).forEach(tag => {
      hashtags[tag] = (hashtags[tag] || 0) + 1;
    });
  });
  return Object.fromEntries(
    Object.entries(hashtags)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  );
}

function analyzePostingPattern(tweets: any[]): any {
  const timestamps = tweets
    .map(tweet => new Date(tweet.metadata.timestamp))
    .sort((a, b) => a.getTime() - b.getTime());

  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i].getTime() - timestamps[i-1].getTime());
  }

  return {
    averageInterval: intervals.reduce((a, b) => a + b, 0) / intervals.length,
    firstTweet: timestamps[0],
    lastTweet: timestamps[timestamps.length - 1],
    totalDuration: timestamps[timestamps.length - 1].getTime() - timestamps[0].getTime()
  };
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

// Run the example
main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
