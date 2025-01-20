import { Scraper, SearchMode, type Tweet } from "agent-twitter-client";
import type { JSONSchemaType } from "ajv";
import { Logger } from "../core/logger";
import { LogLevel } from "../types";
import chalk from "chalk";
interface TwitterCredentials {
  username: string;
  password: string;
  email: string;
}

interface TweetData {
  content: string;
  inReplyTo?: string;
  conversationId?: string;
}

// Schema for tweet output validation
export const tweetSchema: JSONSchemaType<TweetData> = {
  type: "object",
  properties: {
    content: { type: "string" },
    inReplyTo: { type: "string", nullable: true },
    conversationId: { type: "string", nullable: true },
  },
  required: ["content"],
  additionalProperties: false,
};

export class TwitterClient {
  private scraper: Scraper;
  private isInitialized: boolean = false;
  private lastCheckedTweetId: bigint | null = null;
  private logger: Logger;

  constructor(
    private credentials: TwitterCredentials,
    logLevel: LogLevel = LogLevel.INFO
  ) {
    this.scraper = new Scraper();
    this.logger = new Logger({
      level: logLevel,
      enableColors: true,
      enableTimestamp: true,
    });
  }

  private async initialize() {
    if (!this.isInitialized) {
      try {
        await this.scraper.login(
          this.credentials.username,
          this.credentials.password,
          this.credentials.email
        );
        this.isInitialized = true;
        this.logger.info("TwitterClient", "Initialized successfully");
      } catch (error) {
        this.logger.error("TwitterClient", "Failed to initialize", { error });
        throw error;
      }
    }
  }

  /**
   * Create an input that monitors mentions
   */
  public createMentionsInput(interval: number = 60000) {
    return {
      name: "twitter_mentions",
      handler: async () => {
        await this.initialize();
        return this.checkMentions();
      },
      response: {
        type: "string",
        content: "string",
        metadata: "object",
      },
      interval,
    };
  }

  /**
   * Create an input that monitors a user's timeline
   */
  public createTimelineInput(username: string, interval: number = 60000) {
    chalk.green(`twitter_timeline_${username}`);
    return {
      name: `twitter_timeline_${username}`,
      handler: async () => {
        await this.initialize();
        const tweets = await this.fetchUserTweets(username);
        return tweets.map(this.formatTweetData);
      },
      response: {
        type: "string",
        content: "string",
        metadata: "object",
      },
      interval,
    };
  }

  /**
   * Create an output for sending tweets
   */
  public createTweetOutput() {
    return {
      name: "twitter_tweet",
      handler: async (data: TweetData) => {
        await this.initialize();
        return this.sendTweet(data);
      },
      response: {
        success: "boolean",
        tweetId: "string",
      },
      schema: tweetSchema,
    };
  }

  private async checkMentions() {
    try {
      this.logger.debug("TwitterClient.checkMentions", "Checking mentions", {
        username: this.credentials.username,
      });

      const mentions = await this.scraper.fetchSearchTweets(
        `@${this.credentials.username}`,
        20,
        SearchMode.Latest
      );

      // Convert AsyncGenerator to array and process
      const mentionsArray: Tweet[] = [];
      for await (const tweet of mentions.tweets) {
        mentionsArray.push(tweet);
      }

      // Filter and format mentions
      return mentionsArray
        .filter(
          (tweet) =>
            tweet.userId !== this.credentials.username &&
            (!this.lastCheckedTweetId ||
              BigInt(tweet.id ?? "") > this.lastCheckedTweetId)
        )
        .map((tweet) => {
          this.lastCheckedTweetId = BigInt(tweet.id ?? "");
          return this.formatTweetData(tweet);
        });
    } catch (error) {
      this.logger.error(
        "TwitterClient.checkMentions",
        "Error checking mentions",
        { error }
      );
      throw error;
    }
  }

  private async fetchUserTweets(username: string): Promise<Tweet[]> {
    const tweets: Tweet[] = [];
    try {
      for await (const tweet of this.scraper.getTweets(username, 10)) {
        tweets.push(tweet);
      }
    } catch (error) {
      this.logger.error(
        "TwitterClient.fetchUserTweets",
        "Error fetching tweets",
        { error }
      );
      throw error;
    }
    return tweets;
  }

  private async sendTweet(data: TweetData) {
    try {
      // TODO: Implement actual tweet sending using scraper
      this.logger.info("TwitterClient.sendTweet", "Would send tweet", { data });

      return {
        success: true,
        tweetId: "mock-tweet-id", // Replace with actual tweet ID
      };
    } catch (error) {
      this.logger.error("TwitterClient.sendTweet", "Error sending tweet", {
        error,
      });
      throw error;
    }
  }

  private formatTweetData(tweet: Tweet) {
    return {
      type: "tweet",
      content: tweet.text ?? "",
      metadata: {
        tweetId: tweet.id,
        userId: tweet.userId,
        username: tweet.username,
        timestamp: new Date(tweet.timestamp ?? ""),
        metrics: {
          likes: tweet.likes,
          retweets: tweet.retweets,
          replies: tweet.replies,
        },
        isRetweet: tweet.isRetweet,
        isReply: tweet.isReply,
        hasMedia: tweet.photos.length > 0 || tweet.videos.length > 0,
        url: tweet.permanentUrl,
        conversationId: tweet.conversationId,
        inReplyToId: tweet.inReplyToStatusId,
      },
    };
  }
}

// Example usage:
/*
const twitter = new TwitterClient({
  username: "mybot",
  password: "pass",
  email: "bot@example.com"
});

// Register inputs
core.registerInput(twitter.createMentionsInput());
core.registerInput(twitter.createTimelineInput("elonmusk"));

// Register output
core.registerOutput(twitter.createTweetOutput());
*/
