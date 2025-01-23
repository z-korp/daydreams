import { Core } from "../../packages/core/src/core/core";
import { TwitterClient } from "../../packages/core/src/io/twitter";
import { RoomManager } from "../../packages/core/src/core/room-manager";
import { ChromaVectorDB } from "../../packages/core/src/core/vector-db";
import { Processor } from "../../packages/core/src/core/processor";
import { LLMClient } from "../../packages/core/src/core/llm-client";
import { env } from "../../packages/core/src/core/env";
import { LogLevel } from "../../packages/core/src/types";
import { defaultCharacter } from "../../packages/core/src/core/character";
import { ChainOfThought } from "../../packages/core/src/core/chain-of-thought";
import { z } from "zod";
import chalk from "chalk";
import { TWITTER_CONTEXT } from "./twitter-context";

// Add logging utility
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
  const loglevel = LogLevel.ERROR;
  
  // Initialisation des composants principaux
  const vectorDb = new ChromaVectorDB("twitter_generator", {
    chromaUrl: "http://localhost:8000",
    logLevel: loglevel,
  });

  const roomManager = new RoomManager(vectorDb);
  const llmClient = new LLMClient({
    model: "deepseek/deepseek-r1",
  });

  // Initialisation du processeur avec le personnage par défaut
  const processor = new Processor(
    vectorDb,
    llmClient,
    defaultCharacter,
    LogLevel.INFO
  );

  // Initialisation du core
  const core = new Core(roomManager, vectorDb, processor, {
    logging: {
      level: loglevel,
      enableColors: true,
      enableTimestamp: true,
    },
  });

  // Initialisation de ChainOfThought au lieu de Consciousness
  const dreams = new ChainOfThought(
    llmClient,
    vectorDb,
    {
      worldState: TWITTER_CONTEXT,
    }
  );

  // Ajout des event handlers pour le debug
  dreams.on("think:start", ({ query }) => {
    logWithTimestamp('INFO', "Début de la génération", { query });
  });

  dreams.on("think:complete", ({ result }) => {
    logWithTimestamp('SUCCESS', "Génération terminée", { result });
  });

  // Client Twitter
  const twitter = new TwitterClient(
    {
      username: env.TWITTER_USERNAME,
      password: env.TWITTER_PASSWORD,
      email: env.TWITTER_EMAIL,
    },
    loglevel
  );

  // Enregistrement du générateur de tweets
  core.registerInput({
    name: "tweet_generator",
    handler: async () => {
      try {
        logWithTimestamp('INFO', "Démarrage de la génération d'un nouveau tweet");
        
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
        
        logWithTimestamp('INFO', "Réponse du LLM:", thought);

        if (thought === undefined || thought === null || thought === '') {
          logWithTimestamp('WARNING', "La pensée est null ou undefined");
          return null;
        }

        const tweet = {
          type: "generated_tweet",
          content: thought.slice(0, 280),
          metadata: {
            timestamp: new Date().toISOString(),
            generated: true
          },
        };

        logWithTimestamp('SUCCESS', "Tweet préparé pour publication", tweet);
        return tweet;

      } catch (error) {
        logWithTimestamp('ERROR', "Erreur lors de la génération du tweet", {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined
        });
        return null;
      }
    },
    response: z.object({
      type: z.string(),
      content: z.string(),
      metadata: z.record(z.any()),
    }),
    interval: 1800000, // Toutes les 30 minutes
  });

  // Enregistrement du publisher de tweets
  core.registerOutput({
    name: "tweet_publisher",
    handler: async (data: unknown) => {
      console.log(data);
      const tweetData = data as { content: string };
      return twitter.createTweetOutput().handler({
        content: tweetData.content,
      });
    },
    schema: z.object({
      content: z.string().max(280),
    }),
  });

  console.log(chalk.cyan("🤖 Générateur de tweets démarré..."));
  console.log(chalk.cyan("Appuyez sur Ctrl+C pour arrêter"));

  // Gestion de l'arrêt
  process.on("SIGINT", async () => {
    console.log(chalk.yellow("\n\nArrêt en cours..."));
    
    core.removeInput("tweet_generator");
    core.removeOutput("tweet_publisher");
    console.log(chalk.green("✅ Arrêt terminé"));
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red("Erreur fatale:"), error);
  process.exit(1);
});