import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { PROVIDER_GUIDE, ZIDLE_CONTEXT } from "./zidle/zidle";
import chalk from "chalk";
import { JSONSchemaType } from "ajv";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { GoalStatus, LogLevel } from "../packages/core/src/types";
import { z } from "zod";
import { StarknetChain } from "../packages/core/src/core/chains/starknet";
import { fetchGraphQL } from "../packages/core/src/core/providers";
import { env } from "../packages/core/src/core/env";

/**
 * Helper function to format goal status with colored icons
 */
function printGoalStatus(status: GoalStatus): string {
  const colors: Record<GoalStatus, string> = {
    pending: chalk.yellow("⏳ PENDING"),
    active: chalk.blue("▶️ ACTIVE"),
    completed: chalk.green("✅ COMPLETED"),
    failed: chalk.red("❌ FAILED"),
    ready: chalk.cyan("🎯 READY"),
    blocked: chalk.red("🚫 BLOCKED"),
  };
  return colors[status] || status;
}

async function main() {
  // Initialize LLM client
  const llmClient = new LLMClient({
    model: "anthropic/claude-3-5-sonnet-latest", //"deepseek/deepseek-r1", //"anthropic/claude-3.5-haiku-20241022:beta"
  });

  const memory = new ChromaVectorDB("agent_memory", {
    chromaUrl: "http://localhost:8000",
    logLevel: LogLevel.WARN,
  });
  await memory.purge(); // Clear previous session data

  const starknetChain = new StarknetChain({
    rpcUrl: env.STARKNET_RPC_URL,
    address: env.STARKNET_ADDRESS,
    privateKey: env.STARKNET_PRIVATE_KEY,
  });

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
  const dreams = new ChainOfThought(
    llmClient,
    memory,
    {
      worldState: ZIDLE_CONTEXT,
      providerContext: PROVIDER_GUIDE,
    },
    { logLevel: LogLevel.DEBUG }
  );

  dreams.registerOutput({
    name: "EXECUTE_READ",
    handler: async (data: any) => {
      const result = await starknetChain.read(data.payload);
      return `Transaction: ${JSON.stringify(result, null, 2)}`;
    },
    schema: z
      .object({
        contractAddress: z
          .string()
          .describe("The address of the contract to read from"),
        entrypoint: z
          .string()
          .describe("The entrypoint to call on the contract"),
        calldata: z
          .array(z.union([z.number(), z.string()]))
          .describe("The calldata to pass to the entrypoint"),
      })
      .describe(
        "The payload to use to call, never include slashes or comments"
      ),
  });

  dreams.registerOutput({
    name: "EXECUTE_TRANSACTION",
    handler: async (data: any) => {
      const result = await starknetChain.write(data.payload);
      return `Transaction: ${JSON.stringify(result, null, 2)}`;
    },
    schema: z
      .object({
        contractAddress: z
          .string()
          .describe(
            "The address of the contract to execute the transaction on"
          ),
        entrypoint: z
          .string()
          .describe("The entrypoint to call on the contract"),
        calldata: z
          .array(z.union([z.number(), z.string()]))
          .describe("The calldata to pass to the entrypoint"),
      })
      .describe(
        "The payload to execute the transaction, never include slashes or comments"
      ),
  });

  dreams.registerOutput({
    name: "GRAPHQL_FETCH",
    handler: async (data: any) => {
      console.log("[GRAPHQL_FETCH handler] data", data);
      const { query, variables } = data.payload ?? {};
      const result = await fetchGraphQL(
        env.GRAPHQL_URL + "/graphql",
        query,
        variables
      );
      const resultStr = [
        `query: ${query}`,
        `result: ${JSON.stringify(result, null, 2)}`,
      ].join("\n\n");
      return `GraphQL data fetched successfully: ${resultStr}`;
    },
    schema: z
      .object({
        query: z
          .string()
          .describe(
            `query ZidleMinerModels { zidleMinerModels(where: { token_id: "0x10" }) {totalCount edges { node { resource_type xp } } } }`
          ),
      })
      .describe(
        "The payload to fetch data from the zIdle GraphQL API, never include slashes or comments"
      ),
  });

  // Set up event logging

  // Thought process events
  dreams.on("step", (step) => {
    if (step.type === "system") {
      console.log("\n💭 System prompt:", step.content);
    } else {
      console.log("\n🤔 New thought step:", {
        content: step.content,
        tags: step.tags,
      });
    }
  });

  // Uncomment to log token usage
  // llmClient.on("trace:tokens", ({ input, output }) => {
  //   console.log("\n💡 Tokens used:", { input, output });
  // });

  // Action execution events
  dreams.on("action:start", (action) => {
    console.log("\n🎬 Starting action:", {
      type: action.type,
      payload: action.payload,
    });
  });

  dreams.on("action:complete", ({ action, result }) => {
    console.log("\n✅ Action complete:", {
      type: action.type,
      result,
    });
  });

  dreams.on("action:error", ({ action, error }) => {
    console.log("\n❌ Action failed:", {
      type: action.type,
      error,
    });
  });

  // Thinking process events
  dreams.on("think:start", ({ query }) => {
    console.log("\n🧠 Starting to think about:", query);
  });

  dreams.on("think:complete", ({ query }) => {
    console.log("\n🎉 Finished thinking about:", query);
  });

  dreams.on("think:timeout", ({ query }) => {
    console.log("\n⏰ Thinking timed out for:", query);
  });

  dreams.on("think:error", ({ query, error }) => {
    console.log("\n💥 Error while thinking about:", query, error);
  });

  // Goal management events
  dreams.on("goal:created", ({ id, description }) => {
    console.log(chalk.cyan("\n🎯 New goal created:"), {
      id,
      description,
    });
  });

  dreams.on("goal:updated", ({ id, status }) => {
    console.log(chalk.yellow("\n📝 Goal status updated:"), {
      id,
      status: printGoalStatus(status),
    });
  });

  dreams.on("goal:completed", ({ id, result }) => {
    console.log(chalk.green("\n✨ Goal completed:"), {
      id,
      result,
    });
  });

  dreams.on("goal:failed", ({ id, error }) => {
    console.log(chalk.red("\n💥 Goal failed:"), {
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  // Memory management events
  dreams.on("memory:experience_stored", ({ experience }) => {
    console.log(chalk.blue("\n💾 New experience stored:"), {
      action: experience.action,
      outcome: experience.outcome,
      importance: experience.importance,
      timestamp: experience.timestamp,
    });

    if (experience.emotions?.length) {
      console.log(
        chalk.blue("😊 Emotional context:"),
        experience.emotions.join(", ")
      );
    }
  });

  dreams.on("memory:knowledge_stored", ({ document }) => {
    console.log(chalk.magenta("\n📚 New knowledge documented:"), {
      title: document.title,
      category: document.category,
      tags: document.tags,
      lastUpdated: document.lastUpdated,
    });
    console.log(chalk.magenta("📝 Content:"), document.content);
  });

  dreams.on("memory:experience_retrieved", ({ experiences }) => {
    console.log(chalk.yellow("\n🔍 Relevant past experiences found:"));
    experiences.forEach((exp, index) => {
      console.log(chalk.yellow(`\n${index + 1}. Previous Experience:`));
      console.log(`   Action: ${exp.action}`);
      console.log(`   Outcome: ${exp.outcome}`);
      console.log(`   Importance: ${exp.importance || "N/A"}`);
      if (exp.emotions?.length) {
        console.log(`   Emotions: ${exp.emotions.join(", ")}`);
      }
    });
  });

  dreams.on("memory:knowledge_retrieved", ({ documents }) => {
    console.log(chalk.green("\n📖 Relevant knowledge retrieved:"));
    documents.forEach((doc, index) => {
      console.log(chalk.green(`\n${index + 1}. Knowledge Entry:`));
      console.log(`   Title: ${doc.title}`);
      console.log(`   Category: ${doc.category}`);
      console.log(`   Tags: ${doc.tags.join(", ")}`);
      console.log(`   Content: ${doc.content}`);
    });
  });

  // Start the AI agent
  try {
    console.log(chalk.cyan("\n🤖 Starting zIdle AI agent..."));

    // Initial analysis
    const result = await dreams.think(
      "First Goal: Get NFT token ID before proceeding with any other actions. When this goal is done you can start mining resources efficiently to maximize XP gain"
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
