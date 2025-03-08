import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type {
  AnyAgent,
  Episode,
  WorkingMemory,
  Log,
  ActionResult,
  Action,
  Thought,
} from "../types";
import { z } from "zod";
import { v7 as randomUUIDv7 } from "uuid";

export const generateEpisodicMemory = async (
  agent: AnyAgent,
  thoughts: Thought[],
  actions: Action[],
  results: ActionResult[]
): Promise<{
  observation: string;
  thoughts: string;
  result: string;
}> => {
  const extractEpisode = await generateObject({
    model: agent.memory.vectorModel || openai("gpt-4-turbo"),
    schema: z.object({
      observation: z.string().describe("The context and setup - what happened"),
      thoughts: z
        .string()
        .describe(
          "Internal reasoning process and observations of the agent in the episode that let it arrive at the correct action and result. 'I ...'"
        ),
      result: z
        .string()
        .describe(
          "Outcome and retrospective. What did you do well? What could you do better next time? I ..."
        ),
    }),
    prompt: `
    You are creating an episodic memory for an AI agent to help it recall and learn from past experiences.
    
    Your task is to analyze the agent's thoughts, actions, and the results of those actions to create a structured memory that can be used for future reference and learning.

    ## Context
    <thoughts>
    ${JSON.stringify(thoughts)}
    </thoughts>

    ## Actions Taken
    <actions>
    ${JSON.stringify(actions)}
    </actions>

    ## Results & Outcomes
    <results>
    ${JSON.stringify(results)}
    </results>
    
    ## Instructions
    Create a comprehensive episodic memory with these components:
    
    1. OBSERVATION: Provide a clear, concise description of the situation, context, and key elements. Include:
       - What was the environment or scenario?
       - What was the agent trying to accomplish?
       - What were the initial conditions or constraints?
    
    2. THOUGHTS: Capture the agent's internal reasoning process that led to its actions:
       - What was the agent's understanding of the situation?
       - What strategies or approaches did it consider?
       - What key insights or realizations occurred during the process?
       - Use first-person perspective ("I realized...", "I considered...")
    
    3. RESULT: Summarize the outcomes and provide a retrospective analysis:
       - What was accomplished or not accomplished?
       - What worked well and what didn't?
       - What lessons can be learned for future similar situations?
       - What would be done differently next time?
       - Use first-person perspective ("I succeeded in...", "Next time I would...")
    
    Make the memory detailed enough to be useful for future recall, but concise enough to be quickly processed. Focus on capturing the essence of the experience, key decision points, and lessons learned.`,
  });

  return {
    observation: extractEpisode.object.observation,
    thoughts: extractEpisode.object.thoughts,
    result: extractEpisode.object.result,
  };
};

export async function createEpisodeFromWorkingMemory(
  thoughts: Thought[],
  actions: Action[],
  results: ActionResult[],
  agent: AnyAgent
): Promise<Episode> {

  const episodicMemory = await generateEpisodicMemory(
    agent,
    thoughts,
    actions,
    results
  );

  console.log(episodicMemory);

  return {
    id: randomUUIDv7(),
    timestamp: Date.now(),
    observation: episodicMemory.observation,
    result: episodicMemory.result,
    thoughts: episodicMemory.thoughts,
  };
}
