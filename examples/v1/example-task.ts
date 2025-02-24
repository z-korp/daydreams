/**
 * Basic example demonstrating a simple chat interface using Dreams
 * with a command line interface and Groq's LLM.
 */
import { createGroq } from "@ai-sdk/groq";
import {
  createDreams,
  context,
  render,
  action,
  LogLevel,
  output,
  createContainer,
  type InferContextMemory,
} from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { deepResearch } from "./deep-research/research";
import { string, z } from "zod";
import { tavily } from "@tavily/core";
import { ETERNUM_CONTEXT } from "../v0/eternum-context";
import { anthropic } from "@ai-sdk/anthropic";

const taskSchema = z.object({
  plan: z.string().optional(),
  meta: z.any().optional(),
  actions: z.array(
    z.object({
      type: z.string(),
      context: z.string(),
      payload: z.any(),
    })
  ),
});

export const goalSchema = z
  .object({
    id: z.string(),
    description: z.string().describe("A description of the goal"),
    success_criteria: z.array(z.string()).describe("The criteria for success"),
    dependencies: z.array(z.string()).describe("The dependencies of the goal"),
    priority: z.number().min(1).max(10).describe("The priority of the goal"),
    required_resources: z
      .array(z.string())
      .describe("The resources needed to achieve the goal"),
    estimated_difficulty: z
      .number()
      .min(1)
      .max(10)
      .describe("The estimated difficulty of the goal"),
    tasks: z
      .array(taskSchema)
      .describe(
        "The tasks to achieve the goal. This is where you build potential tasks you need todo, based on your understanding of what you can do. These are actions."
      ),
  })
  .describe("A goal to be achieved");

export const goalPlanningSchema = z.object({
  long_term: z
    .array(goalSchema)
    .describe("Strategic goals that are the main goals you want to achieve"),
  medium_term: z
    .array(goalSchema)
    .describe(
      "Tactical goals that will require many short term goals to achieve"
    ),
  short_term: z
    .array(goalSchema)
    .describe(
      "Immediate actionable goals that will require a few tasks to achieve"
    ),
});

// Initialize Groq client
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const template = `

Goal: {{goal}} 
Tasks: {{tasks}}
Current Task: {{currentTask}}

<goal_planning_rules>
1. Break down the objective into hierarchical goals
2. Each goal must have clear success criteria
3. Identify dependencies between goals
4. Prioritize goals (1-10) based on urgency and impact
5. short term goals should be given a priority of 10
6. Ensure goals are achievable given the current context
7. Consider past experiences when setting goals
8. Use available game state information to inform strategy

# Each goal must include:
- id: Unique temporary ID used in dependencies
- description: Clear goal statement
- success_criteria: Array of specific conditions for completion
- dependencies: Array of prerequisite goal IDs (empty for initial goals)
- priority: Number 1-10 (10 being highest)
- required_resources: Array of resources needed (based on game state)
- estimated_difficulty: Number 1-10 based on past experiences
</goal_planning_rules>
`;

type Goal = z.infer<typeof goalPlanningSchema>;

const goalContexts = context({
  type: "goal-manager",
  schema: z.object({
    id: string(),
  }),

  key({ id }) {
    return id;
  },

  create(state) {
    return {
      goal: null as null | Goal,
      tasks: [],
      currentTask: null,
    };
  },

  render({ memory }) {
    return render(template, {
      goal: memory.goal ?? "NONE",
      tasks: memory?.tasks?.join("\n"),
      currentTask: memory?.currentTask ?? "NONE",
    });
  },
});

const container = createContainer();

container.singleton("tavily", () => {
  return tavily({
    apiKey: process.env.TAVILY_API_KEY!,
  });
});

type GoalContextMemory = InferContextMemory<typeof goalContexts>;

// Create Dreams agent instance
const agent = createDreams({
  logger: LogLevel.DEBUG,
  debugger: async (contextId, keys, data) => {
    const [type, id] = keys;
    await Bun.write(`./logs/tasks/${contextId}/${id}-${type}.md`, data);
  },
  model: anthropic("claude-3-7-sonnet-latest"),
  extensions: [cli, deepResearch],
  context: goalContexts,
  container,
  actions: [
    action({
      name: "buildGoals",
      description: "Build a hierarchical goal structure based on an objective",
      schema: z.object({
        objective: z.string().describe("The main objective to achieve"),
        context: z
          .string()
          .optional()
          .describe("Additional context for goal planning"),
      }),
      handler(call, ctx, agent) {
        const agentMemory = ctx.agentMemory as GoalContextMemory;

        // Initialize goal structure if it doesn't exist
        if (!agentMemory.goal) {
          agentMemory.goal = {
            long_term: [],
            medium_term: [],
            short_term: [],
          };
        }

        // Return the current goal structure
        return {
          message: `Goals are being built for objective: ${call.data.objective}`,
          currentGoals: agentMemory.goal,
        };
      },
    }),

    action({
      name: "decomposeGoal",
      description: "Decompose a goal into executable tasks",
      schema: z.object({
        goalId: z.string().describe("ID of the goal to decompose"),
        goalType: z
          .enum(["long_term", "medium_term", "short_term"])
          .describe("Type of goal"),
      }),
      handler(call, ctx, agent) {
        const agentMemory = ctx.agentMemory as GoalContextMemory;

        if (!agentMemory.goal) {
          return { error: "No goals have been set yet" };
        }

        const goalType = call.data.goalType;
        const goalId = call.data.goalId;

        // Find the goal in the specified category
        const goal = agentMemory.goal[goalType].find((g) => g.id === goalId);

        if (!goal) {
          return {
            error: `Goal with ID ${goalId} not found in ${goalType} goals`,
          };
        }

        // Return the goal for task decomposition
        return {
          goal,
          message: `Ready to decompose goal: ${goal.description}`,
        };
      },
    }),

    action({
      name: "setGoalPlan",
      description: "Set the complete goal plan",
      schema: z.object({ goal: goalPlanningSchema }),
      handler(call, ctx, agent) {
        const agentMemory = ctx.agentMemory as GoalContextMemory;
        agentMemory.goal = call.data.goal;
        return {
          plan: call.data.goal,
          message: "Goal plan has been set successfully",
        };
      },
    }),

    action({
      name: "updateGoal",
      description: "Update a goal's state or properties",
      schema: z.object({
        goalId: z.string().describe("ID of the goal to update"),
        goalType: z
          .enum(["long_term", "medium_term", "short_term"])
          .describe("Type of goal"),
        updates: goalSchema.partial().describe("Properties to update"),
      }),
      handler(call, ctx, agent) {
        const agentMemory = ctx.agentMemory as GoalContextMemory;

        if (!agentMemory.goal) {
          return { error: "No goals have been set yet" };
        }

        const goalType = call.data.goalType;
        const goalId = call.data.goalId;

        // Find the goal in the specified category
        const goalIndex = agentMemory.goal[goalType].findIndex(
          (g) => g.id === goalId
        );

        if (goalIndex === -1) {
          return {
            error: `Goal with ID ${goalId} not found in ${goalType} goals`,
          };
        }

        // Update the goal with the provided updates
        agentMemory.goal[goalType][goalIndex] = {
          ...agentMemory.goal[goalType][goalIndex],
          ...call.data.updates,
        };

        return {
          updatedGoal: agentMemory.goal[goalType][goalIndex],
          message: `Goal ${goalId} has been updated successfully`,
        };
      },
    }),

    action({
      name: "queryEternum",
      description:
        "This will tell you everything you need to know about Eternum for how to win the game",
      schema: z.object({ query: z.string() }),
      handler(call, ctx, agent) {
        return {
          data: {
            result: ETERNUM_CONTEXT,
          },
          timestamp: Date.now(),
        };
      },
    }),
    action({
      name: "Query:Eternum:Graphql",
      description: "Search Eternum GraphQL API",
      schema: z.object({ query: z.string() }),
      handler(call, ctx, agent) {
        console.log(call.data.query);
        return {
          data: {
            result: ETERNUM_CONTEXT,
          },
          timestamp: Date.now(),
        };
      },
    }),
  ],
  outputs: {
    "goal-manager:state": output({
      description:
        "Use this when you need to update the goals. Use the goal id to update the goal. You should attempt the goal then call this to update the goal.",
      instructions: "Increment the state of the goal manager",
      schema: z.object({
        type: z
          .enum(["SET", "UPDATE"])
          .describe("SET to set the goals. UPDATE to update a goal."),
        goal: goalSchema,
      }),
      handler: async (call, ctx, agent) => {
        // get goal id
        // update state of the goal id and the changes
        console.log("handler", { call, ctx, agent });

        return {
          data: {
            goal: "",
          },
          timestamp: Date.now(),
        };
      },
    }),
  },
}).start({
  id: "game",
});
