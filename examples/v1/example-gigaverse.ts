import { anthropic } from "@ai-sdk/anthropic";
import { createGroq } from "@ai-sdk/groq";
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

const env = validateEnv(
  z.object({
    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
    GIGA_TOKEN: z.string().min(1, "GIGA_TOKEN is required"),
  })
);

// 1. Take action -> check health -> check loot phase = true -> select loot
// 2. Select the loot -> takes to new phase -> take 1. again

const template = `

// inject more information about how you want it to play....


Goal: {{goal}} 
Tasks: {{tasks}}
Current Task: {{currentTask}}
`;

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

// ==========================================
// ACTIONS DEFINITION
// ==========================================

/**
 * Create the Gigaverse agent with all necessary actions
 */
createDreams({
  logger: LogLevel.DEBUG,
  model: anthropic("claude-3-7-sonnet-latest"),
  extensions: [cli],
  context: goalContexts,
  actions: [
    // start run (sends the starting 1-2 dungeon)
    // collect loot (selects the loot from the resonse)
    /**
     * Action to attack in the rock-paper-scissors game
     */
    action({
      name: "attackInDungeon",
      description:
        "Attack in the dungeon using rock-paper-scissors game mechanics",
      schema: z.object({
        action: z
          .enum(["rock", "paper", "scissors"])
          .describe("The attack move to make"),
      }),
      async handler(
        call: ActionCall<{
          action: "rock" | "paper" | "scissors";
        }>,
        ctx: any,
        agent: Agent
      ) {
        try {
          const { action } = call.data;

          const payload = {
            action: action,
            actionToken: new Date().getTime().toString(),
            dungeonId: 0,
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
          return {
            success: true,
            result,
            message: `Successfully performed ${action} attack in dungeon ${0}`,
          };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error("Error performing attack action:", error);
          return {
            success: false,
            error: errorMessage,
            message: "Failed to perform attack action",
          };
        }
      },
    }),

    // /**
    //  * Action to buy items from the shop
    //  */
    // action({
    //   name: "claimLoot",
    //   description: "Claim loot from the dungeon",
    //   schema: z.object({
    //     itemId: z.string().describe("ID of the item to purchase"),
    //     quantity: z
    //       .number()
    //       .default(1)
    //       .describe("Quantity of items to purchase"),
    //     dungeonId: z.number().describe("The ID of the dungeon"),
    //     token: z.string().describe("Bearer token for authentication"),
    //   }),
    //   async handler(
    //     call: ActionCall<{
    //       itemId: string;
    //       quantity: number;
    //       dungeonId: number;
    //     }>,
    //     ctx: any,
    //     agent: Agent
    //   ) {
    //     try {
    //       const { itemId, quantity, dungeonId } = call.data;

    //       const payload = {
    //         action: "buy",
    //         itemId: itemId,
    //         quantity: quantity,
    //         dungeonId: dungeonId,
    //         actionToken: new Date().getTime().toString(),
    //       };

    //       const response = await fetch(
    //         "https://gigaverse.io/api/game/dungeon/action",
    //         {
    //           method: "POST",
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: `Bearer ${env.GIGA_TOKEN}`,
    //           },
    //           body: JSON.stringify(payload),
    //         }
    //       );

    //       if (!response.ok) {
    //         throw new Error(
    //           `Shop purchase failed with status ${response.status}`
    //         );
    //       }

    //       const result = await response.json();
    //       return {
    //         success: true,
    //         result,
    //         message: `Successfully purchased ${quantity} of item ${itemId} in dungeon ${dungeonId}`,
    //       };
    //     } catch (error: unknown) {
    //       const errorMessage =
    //         error instanceof Error ? error.message : String(error);
    //       console.error("Error performing shop purchase:", error);
    //       return {
    //         success: false,
    //         error: errorMessage,
    //         message: "Failed to perform shop purchase",
    //       };
    //     }
    //   },
    // }),
  ],
}).start({ id: "test", initialGoal: "", initialTasks: [] });
