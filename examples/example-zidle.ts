import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { PROVIDER_GUIDE, ZIDLE_CONTEXT } from "./zidle";
import { starknetTransactionAction } from "../packages/core/src/core/actions/starknet-transaction";
import { starknetReadAction } from "../packages/core/src/core/actions/starknet-read";
import chalk from "chalk";
import { JSONSchemaType } from "ajv";
import { starknetTransactionSchema } from "../packages/core/src/core/validation";
import { graphqlAction } from "../packages/core/src/core/actions/graphql";
import ManifestParser from "./zidle/manifest_parser";
import manifest from "./zidle/manifest.json";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";

interface GraphQLPayload {
  query: string;
}

const graphqlFetchSchema: JSONSchemaType<GraphQLPayload> = {
  type: "object",
  properties: {
    query: { type: "string" },
  },
  required: ["query"],
  additionalProperties: false,
};

async function main() {
  // Initialize LLM client
  const llmClient = new LLMClient({
    model: "anthropic/claude-3.5-haiku-20241022:beta",
  });

  const memory = new ChromaVectorDB("agent_memory");
  await memory.purge(); // Clear previous session data

  const dojo_parser = new ManifestParser(JSON.stringify(manifest));

  // Load initial context documents
  await memory.storeDocument({
    title: "Game Rules",
    content: ZIDLE_CONTEXT,
    category: "rules",
    tags: ["game-mechanics", "rules"],
    lastUpdated: new Date(),
  });

  await memory.storeDocument({
    title: "Provider Guide",
    content: PROVIDER_GUIDE,
    category: "actions",
    tags: ["actions", "provider-guide"],
    lastUpdated: new Date(),
  });

  // Initialize the main reasoning engine
  const dreams = new ChainOfThought(llmClient, memory, {
    worldState: ZIDLE_CONTEXT,
  });

  dreams.registerAction(
    "GRAPHQL_FETCH",
    graphqlAction,
    {
      description: "Fetch data from the Eternum GraphQL API",
      example: JSON.stringify({
        query:
          "query GetRealmInfo { eternumRealmModels(where: { realm_id: 42 }) { edges { node { ... on eternum_Realm { entity_id level } } } }",
      }),
    },
    graphqlFetchSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    "EXECUTE_TRANSACTION",
    starknetTransactionAction,
    {
      description: "Execute a transaction on the Starknet blockchain",
      example: JSON.stringify({
        contractAddress: "0x1234567890abcdef",
        entrypoint: "execute",
        calldata: [1, 2, 3],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    "EXECUTE_READ",
    starknetReadAction,
    {
      description: "Call a read-only function on the Starknet blockchain",
      example: JSON.stringify({
        contractAddress: "0x1234567890abcdef",
        entrypoint: "read",
        calldata: [1, 2, 3],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  // Add event handlers for monitoring
  dreams.on("think:start", ({ query }) => {
    console.log(chalk.blue("\n🤔 Analyzing game state:"), query);
  });

  dreams.on("action:start", (action) => {
    console.log(chalk.yellow("\n🎮 Executing game action:"), {
      type: action.type,
      payload: action.payload,
    });
  });

  dreams.on("action:complete", ({ action, result }) => {
    console.log(chalk.green("\n✅ Action completed:"), {
      type: action.type,
      result,
    });
  });

  dreams.on("action:error", ({ action, error }) => {
    console.log(chalk.red("\n❌ Action failed:"), {
      type: action.type,
      error,
    });
  });

  // Start the AI agent
  try {
    console.log(chalk.cyan("\n🤖 Starting zIdle AI agent..."));

    // Initial analysis
    const result = await dreams.think(
      "Analyze the current game state and determine the optimal farming strategy. Check resource levels and XP progress, then start farming the most needed resource."
    );

    console.log(chalk.green("\n✨ Initial analysis completed!"));
    console.log("Strategy:", result);

    // Continue monitoring and adjusting strategy
    setInterval(async () => {
      await dreams.think(
        "Review current progress and adjust farming strategy if needed. Consider resource levels, XP gains, and whether we should switch resources."
      );
    }, 5 * 60 * 1000); // Check every 5 minutes
  } catch (error) {
    console.error(chalk.red("Error running AI agent:"), error);
  }

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.log(chalk.yellow("\nShutting down zIdle AI agent..."));
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
