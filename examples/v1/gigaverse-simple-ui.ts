/**
 * Example Gigaverse Integration
 *
 * This file demonstrates integration with the Gigaverse game ecosystem.
 * It sets up an agent that can interact with the Gigaverse API to:
 * - Navigate dungeons
 * - Make combat decisions
 * - Select loot and rewards
 * - Manage inventory and character progression
 *
 * The agent uses a goal-oriented approach to plan and execute actions
 * within the game world, making strategic decisions based on the current
 * game state and available options.
 *
 * Authentication is handled via the GIGA_TOKEN environment variable,
 * which must be properly configured for API access. This is the Bearer token. You can copy this from your browser environment.
 */

import { anthropic } from "@ai-sdk/anthropic";
import {
  createDreams,
  context,
  render,
  action,
  validateEnv,
  LogLevel,
  type ActionCall,
  type Agent,
} from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { string, z } from "zod";
import { simpleUI } from "./simple-ui";

// Initialize the UI
simpleUI.initializeUI();

// Log startup message
simpleUI.logMessage(
  LogLevel.INFO,
  "Starting Gigaverse Dream Agent with Simple Terminal UI..."
);

// Validate environment variables
const env = validateEnv(
  z.object({
    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
    GIGA_TOKEN: z.string().min(1, "GIGA_TOKEN is required"),
  })
);

// Template for the agent's context
const template = `
# Gigaverse Dungeon Game

You are an AI agent playing a rock-paper-scissors dungeon crawler game.

Also make sure to keep the user updated with the CLI on the progress and your thinking around what you are doing. Don't be too verbose, but do your best to keep the user informed.

## Game Rules:
- Combat is resolved through rock-paper-scissors mechanics
- You can collect loot after defeating enemies
- Your goal is to progress as far as possible in the dungeon

## Current Status:
Goal: {{goal}} 
Tasks: {{tasks}}
Current Task: {{currentTask}}

Make strategic decisions based on enemy patterns and your current state.
`;

// Context for the agent
const goalContexts = context({
  type: "goal",
  schema: z.object({
    id: string(),
    initialGoal: z.string(),
    initialTasks: z.array(z.string()),
  }),

  key({ id }) {
    return id;
  },

  create(state) {
    return {
      goal: state.args.initialGoal,
      tasks: state.args.initialTasks ?? [],
      currentTask: state.args.initialTasks?.[0],
    };
  },

  render({ memory }) {
    return render(template, {
      goal: memory.goal,
      tasks: memory.tasks.join("\n"),
      currentTask: memory.currentTask ?? "NONE",
    });
  },
});

// Create the Gigaverse agent with UI integration
const agent = createDreams({
  logger: LogLevel.INFO,
  model: anthropic("claude-3-7-sonnet-latest"),
  extensions: [cli],
  context: goalContexts,
  actions: [
    /**
     * Action to attack in the rock-paper-scissors game
     */
    action({
      name: "attackInDungeon",
      description:
        "Attack in the dungeon using rock-paper-scissors game mechanics",
      schema: z
        .object({
          action: z
            .enum([
              "rock",
              "paper",
              "scissor",
              "loot_one",
              "loot_two",
              "loot_three",
            ])
            .describe("The attack move to make"),
          dungeonId: z
            .number()
            .default(0)
            .describe("The ID of the dungeon. It is always 0."),
        })
        .describe(
          "You use this to make an action in a dungeon. If the lootPhase == true then you can select the Loot option, which will then take you to the next phase. If the lootPhase == false then you can select the Rock, Paper, Scissors option."
        ),
      async handler(
        call: ActionCall<{
          action:
            | "rock"
            | "paper"
            | "scissor"
            | "loot_one"
            | "loot_two"
            | "loot_three";
          dungeonId: number;
        }>,
        ctx: any,
        agent: Agent
      ) {
        try {
          // Log the action to the UI
          simpleUI.logAgentAction(`Attack with ${call.data.action}`, null);

          const { action, dungeonId } = call.data;

          const payload = {
            action: action,
            actionToken: new Date().getTime().toString(),
            dungeonId: dungeonId,
          };

          const response = await fetch(
            "https://gigaverse.io/api/game/dungeon/action",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.GIGA_TOKEN}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Attack action failed with status ${response.status}`
            );
          }

          const result = await response.json();

          // Update the UI with the result
          const successResult = {
            success: true,
            message: `Successfully performed ${action} attack in dungeon ${dungeonId}`,
          };
          simpleUI.logAgentAction(`Attack with ${action}`, successResult);

          // If this was a combat action, visualize the RPS result
          if (["rock", "paper", "scissor"].includes(action)) {
            // Extract enemy move and result from the API response
            let enemyMove = "unknown";
            let battleResult = "draw";

            // Extract data from the response structure
            if (
              result.data &&
              result.data.run &&
              result.data.run.players &&
              result.data.run.players.length >= 2
            ) {
              const playerData = result.data.run.players[0]; // First player is the user
              const enemyData = result.data.run.players[1]; // Second player is the enemy

              // Get the enemy's last move
              enemyMove = enemyData.lastMove || "unknown";

              // Determine the battle result
              if (playerData.thisPlayerWin === true) {
                battleResult = "win";
              } else if (enemyData.thisPlayerWin === true) {
                battleResult = "lose";
              } else {
                battleResult = "draw";
              }
            }

            simpleUI.visualizeRPSMove(action, enemyMove, battleResult);
          }

          // Update game state in the UI
          if (result.gameState) {
            simpleUI.printGameState(result.gameState);
          }

          // Update player stats in the UI
          if (result.playerState) {
            simpleUI.printPlayerStats(result.playerState);
          }

          return {
            success: true,
            result,
            message: `Successfully performed ${action} attack in dungeon ${dungeonId}`,
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error performing attack action:", error);

          // Log the error to the UI
          const failureResult = {
            success: false,
            error: errorMessage,
            message: "Failed to perform attack action",
          };
          simpleUI.logAgentAction(
            `Attack with ${call.data.action}`,
            failureResult
          );

          return {
            success: false,
            error: errorMessage,
            message: "Failed to perform attack action",
          };
        }
      },
    }),

    /**
     * Action to fetch upcoming enemies data
     */
    action({
      name: "getUpcomingEnemies",
      description:
        "Fetch information about all upcoming enemies in the dungeon",
      schema: z.object({}), // No parameters needed for this GET request
      async handler(call: ActionCall<{}>, ctx: any, agent: Agent) {
        try {
          // Log the action to the UI
          simpleUI.logAgentAction("Fetching upcoming enemies", null);

          const response = await fetch(
            "https://gigaverse.io/api/indexer/enemies",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.GIGA_TOKEN}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Fetch enemies failed with status ${response.status}`
            );
          }

          const result = await response.json();

          // Update the enemy info in the UI
          simpleUI.printEnemyInfo(result);

          // Log success to the UI
          const successResult = {
            success: true,
            message: "Successfully fetched upcoming enemies data",
          };
          simpleUI.logAgentAction("Fetching upcoming enemies", successResult);

          return {
            success: true,
            enemies: result,
            message: "Successfully fetched upcoming enemies data",
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error fetching enemies data:", error);

          // Log the error to the UI
          const failureResult = {
            success: false,
            error: errorMessage,
            message: "Failed to fetch upcoming enemies data",
          };
          simpleUI.logAgentAction("Fetching upcoming enemies", failureResult);

          return {
            success: false,
            error: errorMessage,
            message: "Failed to fetch upcoming enemies data",
          };
        }
      },
    }),

    /**
     * Action to fetch the player's current state in the dungeon
     */
    action({
      name: "getPlayerState",
      description: "Fetch the current state of the player in the dungeon",
      schema: z.object({}), // No parameters needed for this GET request
      async handler(call: ActionCall<{}>, ctx: any, agent: Agent) {
        try {
          // Log the action to the UI
          simpleUI.logAgentAction("Fetching player state", null);

          const response = await fetch(
            "https://gigaverse.io/api/game/dungeon/state",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.GIGA_TOKEN}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Fetch player state failed with status ${response.status}`
            );
          }

          const result = await response.json();

          // Update the player stats in the UI
          simpleUI.printPlayerStats(result);

          // Update game state in the UI if available
          if (result.gameState) {
            simpleUI.printGameState(result.gameState);
          }

          // Log success to the UI
          const successResult = {
            success: true,
            message: "Successfully fetched player's dungeon state",
          };
          simpleUI.logAgentAction("Fetching player state", successResult);

          return {
            success: true,
            playerState: result,
            message: "Successfully fetched player's dungeon state",
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error fetching player state:", error);

          // Log the error to the UI
          const failureResult = {
            success: false,
            error: errorMessage,
            message: "Failed to fetch player's dungeon state",
          };
          simpleUI.logAgentAction("Fetching player state", failureResult);

          return {
            success: false,
            error: errorMessage,
            message: "Failed to fetch player's dungeon state",
          };
        }
      },
    }),

    /**
     * Action to start a new dungeon run
     */
    action({
      name: "startNewRun",
      description:
        "Start a new dungeon run. Use this when the player dies or wants to start a new run from outside the dungeon.",
      schema: z.object({
        dungeonId: z
          .number()
          .default(1)
          .describe("The ID of the dungeon to start. Default is 1."),
      }),
      async handler(
        call: ActionCall<{
          dungeonId: number;
        }>,
        ctx: any,
        agent: Agent
      ) {
        try {
          // Log the action to the UI
          simpleUI.logAgentAction(
            `Starting new run in dungeon ${call.data.dungeonId}`,
            null
          );

          const { dungeonId } = call.data;

          const payload = {
            action: "start_run",
            actionToken: new Date().getTime().toString(),
            dungeonId: dungeonId,
          };

          const response = await fetch(
            "https://gigaverse.io/api/game/dungeon/action",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.GIGA_TOKEN}`,
              },
              body: JSON.stringify(payload),
            }
          );

          if (!response.ok) {
            throw new Error(
              `Start new run failed with status ${response.status}`
            );
          }

          const result = await response.json();

          // Update game state in the UI
          if (result.gameState) {
            simpleUI.printGameState(result.gameState);
          }

          // Update player stats in the UI
          if (result.playerState) {
            simpleUI.printPlayerStats(result.playerState);
          }

          // Log success to the UI
          const successResult = {
            success: true,
            message: `Successfully started a new run in dungeon ${dungeonId}`,
          };
          simpleUI.logAgentAction(
            `Starting new run in dungeon ${dungeonId}`,
            successResult
          );

          return {
            success: true,
            result,
            message: `Successfully started a new run in dungeon ${dungeonId}`,
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error starting new run:", error);

          // Log the error to the UI
          const failureResult = {
            success: false,
            error: errorMessage,
            message: "Failed to start a new dungeon run",
          };
          simpleUI.logAgentAction(
            `Starting new run in dungeon ${call.data.dungeonId}`,
            failureResult
          );

          return {
            success: false,
            error: errorMessage,
            message: "Failed to start a new dungeon run",
          };
        }
      },
    }),
  ],
});

// Start the agent with initial goals
simpleUI.logMessage(LogLevel.INFO, "Starting agent with initial goals...");

agent.start({
  id: "gigaverse-game",
  initialGoal:
    "Progress as far as possible in the dungeon by making strategic rock-paper-scissors decisions",
  initialTasks: [
    "Check player state to understand current situation",
    "Fetch information about upcoming enemies",
    "Start a new run if not already in a dungeon",
    "Make strategic combat decisions based on enemy patterns",
    "Select optimal loot to improve chances of survival",
  ],
});

// Display welcome message
simpleUI.logMessage(
  LogLevel.INFO,
  "Gigaverse Dream Agent is now running! The agent will automatically play the game."
);

// Handle exit
process.on("SIGINT", () => {
  simpleUI.logMessage(LogLevel.INFO, "Shutting down agent...");
  process.exit(0);
});
