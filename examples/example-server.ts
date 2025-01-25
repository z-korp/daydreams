import { WebSocketServer, WebSocket } from "ws";
import chalk from "chalk";
import { z } from "zod";

// ---- Import your internal classes and functions here ----
import { LLMClient } from "../packages/core/src/core/llm-client";
import { ChainOfThought } from "../packages/core/src/core/chain-of-thought";
import { ChromaVectorDB } from "../packages/core/src/core/vector-db";
import { StarknetChain } from "../packages/core/src/core/chains/starknet";
import { env } from "../packages/core/src/core/env";
import { fetchGraphQL } from "../packages/core/src/core/providers";

import {
  GoalStatus,
  LogLevel
} from "../packages/core/src/core/types";

// ------------------------------------------------------
// 1) CREATE DAYDREAMS AGENT
// ------------------------------------------------------
function createDaydreamsAgent() {
  // 1.1. LLM Initialization
  const llmClient = new LLMClient({
    model: "anthropic/claude-3-5-sonnet-latest",
  });

  // 1.2. Starknet blockchain initialization
  const starknetChain = new StarknetChain({
    rpcUrl: env.STARKNET_RPC_URL,
    address: env.STARKNET_ADDRESS,
    privateKey: env.STARKNET_PRIVATE_KEY,
  });

  // 1.3. Vector memory initialization
  const memory = new ChromaVectorDB("agent_memory");

  // 1.4. Main reasoning engine
  const dreams = new ChainOfThought(
    llmClient,
    memory,
    { worldState: "You are a helpful assistant." },
    { logLevel: LogLevel.DEBUG }
  );

  // 1.5. Load initial context into memory
  (async () => {
    // For demonstration, we purge the database so we start clean each run
    await memory.purge();
  })().catch(console.error);

  // 1.6. Register actions that the agent can perform
  dreams.registerOutput({
    name: "EXECUTE_TRANSACTION",
    handler: async (data: any) => {
      const result = await starknetChain.write(data.payload);
      return `Transaction executed successfully: ${JSON.stringify(result, null, 2)}`;
    },
    schema: z
      .any()
      .describe(
        "Payload to execute the transaction, never include slashes or comments"
      ),
  });

  dreams.registerOutput({
    name: "GRAPHQL_FETCH",
    handler: async (data: any) => {
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
      .any()
      .describe(
        "Payload to fetch data from the Eternum GraphQL API, never include slashes/comments"
      ),
  });

  // 1.7. Optionally register event handlers 
  dreams.on("goal:created", ({ id, description }) => {
    console.log(chalk.cyan("[WS] New goal created:"), { id, description });
  });

  // Return the main instance that we will use later
  return dreams;
}

// Create a single “global” instance (or one per connection if you prefer isolation)
const dreams = createDaydreamsAgent();

// ------------------------------------------------------
// 2) WEBSOCKET SERVER
// ------------------------------------------------------
const wss = new WebSocketServer({ port: 8080 });
console.log(chalk.green("[WS] WebSocket server listening on ws://localhost:8080"));

/**
 * Helper function to send JSON messages to a client.
 */
function sendJSON(ws: WebSocket, data: unknown) {
  ws.send(JSON.stringify(data));
}

wss.on("connection", (ws) => {
  console.log(chalk.blue("[WS] New client connected."));

  // Send a welcome message to the client
  sendJSON(ws, {
    type: "welcome",
    message: "Welcome to Daydreams WebSocket server!",
  });

  // Handle incoming messages (each message can represent a new goal)
  ws.on("message", async (rawData) => {
    try {
      const dataString = rawData.toString();
      console.log(chalk.magenta("[WS] Received message:"), dataString);

      // We assume the client sends JSON such as: { "goal": "some string" }
      const parsed = JSON.parse(dataString);
      const userGoal = parsed.goal;

      if (!userGoal || typeof userGoal !== "string") {
        throw new Error("Invalid goal format. Expected { goal: string }");
      }

      // 2.1) Plan the goal with Daydreams
      sendJSON(ws, {
        type: "info",
        message: "Planning strategy for goal: " + userGoal,
      });

      await dreams.decomposeObjectiveIntoGoals(userGoal);

      // 2.2) Execute goals until there are no more “ready” goals
      const stats = { completed: 0, failed: 0, total: 0 };

      while (true) {
        const readyGoals = dreams.goalManager.getReadyGoals();
        const activeGoals = dreams.goalManager
          .getGoalsByHorizon("short")
          .filter((g) => g.status === "active");
        const pendingGoals = dreams.goalManager
          .getGoalsByHorizon("short")
          .filter((g) => g.status === "pending");

        // Check if all goals are completed
        if (
          readyGoals.length === 0 &&
          activeGoals.length === 0 &&
          pendingGoals.length === 0
        ) {
          sendJSON(ws, {
            type: "info",
            message: "All goals completed!",
          });
          break;
        }

        // Check if we are blocked
        if (readyGoals.length === 0 && activeGoals.length === 0) {
          sendJSON(ws, {
            type: "warn",
            message: "No ready or active goals, but some goals are pending. Possibly blocked.",
          });
          break;
        }

        // Execute the next ready goal
        try {
          await dreams.processHighestPriorityGoal();
          stats.completed++;
        } catch (err) {
          console.error("[WS] Goal execution failed:", err);
          stats.failed++;
          break; // For simplicity, we stop here
        }
        stats.total++;
      }

      // Send a final summary to the client
      sendJSON(ws, {
        type: "summary",
        message: `Goal execution done. Completed: ${stats.completed}, Failed: ${stats.failed}, Total: ${stats.total}.`,
      });
    } catch (error) {
      console.error(chalk.red("[WS] Error processing message:"), error);
      sendJSON(ws, {
        type: "error",
        error: (error as Error).message || String(error),
      });
    }
  });

  // If the client closes the connection
  ws.on("close", () => {
    console.log(chalk.yellow("[WS] Client disconnected."));
  });
});
