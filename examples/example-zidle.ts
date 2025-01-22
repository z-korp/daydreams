import { env } from "../packages/core/src/core/env";
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { ZIDLE_CONTEXT } from "./zidle-context-easy";
import { starknetTransactionAction } from "../packages/core/src/core/actions/starknet-transaction";
import { starknetReadAction } from "../packages/core/src/core/actions/starknet-read";
import chalk from "chalk";
import { JSONSchemaType } from "ajv";
import { starknetTransactionSchema } from "../packages/core/src/core/validation";
import { graphqlAction } from "../packages/core/src/core/actions/graphql";
import ManifestParser from "./zidle/manifest_parser";
import manifest from "./zidle/manifest.json";

interface FarmResourcePayload {
  resourceType: 1 | 2 | 3;
  duration: number;
}

interface GraphQLPayload {
  query: string;
}

const mineResourceSchema: JSONSchemaType<FarmResourcePayload> = {
  type: "object",
  properties: {
    resourceType: { type: "number", enum: [1, 2, 3] },
    duration: { type: "number", minimum: 1, maximum: 3600 },
  },
  required: ["resourceType", "duration"],
  additionalProperties: false,
};

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
    provider: "anthropic",
    apiKey: env.ANTHROPIC_API_KEY,
  });

  // Initialize ChainOfThought with zIdle context
  const dreams = new ChainOfThought(
    llmClient,
    {
      worldState: ZIDLE_CONTEXT,
    },
    { chromaUrl: "http://localhost:8000" }
  );

  const dojo_parser = new ManifestParser(JSON.stringify(manifest));

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
    "CHECK_NFT",
    starknetReadAction,
    {
      description: "Check if wallet has a character NFT",
      example: JSON.stringify({
        contractAddress: env.NFT_CONTRACT,
        entrypoint: "token_of_owner_by_index",
        calldata: [env.STARKNET_ADDRESS, 1, 0],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    "MINT_NFT",
    starknetTransactionAction,
    {
      description: "Mint a new character NFT",
      example: JSON.stringify({
        contractAddress:
          "0xaf35f90afa36a49d2bc63e783d0f086e03cd14fe5328fc47bab5e39c60c16b",
        entrypoint: "create",
        calldata: ["Farmer#123"],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    "MINE_RCS",
    starknetTransactionAction,
    {
      description:
        "Mine resources with character NFT. Note: ERC721 returns u256 (low, high), but dojo expects u128 (only low)",
      example: JSON.stringify({
        contractAddress: dojo_parser.getAddressByTag("zidle-resources"),
        entrypoint: "mine",
        // For dojo contract, we only use the low part of the u256 token_id
        calldata: ["$TOKEN_ID_LOW", "$RESOURCE_TYPE", "1"],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    "HARVEST_RCS",
    starknetTransactionAction,
    {
      description:
        "Harvest mined resources. Note: ERC721 returns u256 (low, high), but dojo expects u128 (only low)",
      example: JSON.stringify({
        contractAddress: dojo_parser.getAddressByTag("zidle-resources"),
        entrypoint: "harvest",
        // For dojo contract, we only use the low part of the u256 token_id
        calldata: ["$TOKEN_ID_LOW", "$RESOURCE_TYPE"],
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
