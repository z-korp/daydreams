import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type {
  AnyAgent,
  EposodicMemory,
  Episode,
  WorkingMemory,
  Log,
} from "../types";
import { z } from "zod";
import { v7 as randomUUIDv7 } from "uuid";

export const generateEposodicMemory = async (
  agent: AnyAgent,
  conversation: string[]
): Promise<EposodicMemory> => {
  const extractEpisode = await generateObject({
    model: anthropic("claude-3-7-sonnet-latest"),
    schema: z.object({
      episode: z.string(),
      observation: z.string().describe("The context and setup - what happened"),
      thoughts: z
        .string()
        .describe(
          "Internal reasoning process and observations of the agent in the episode that let it arrive at the correct action and result. 'I ...'"
        ),
      action: z
        .string()
        .describe(
          "What was done, how, and in what format. (Include whatever is salient to the success of the action). I .."
        ),
      result: z
        .string()
        .describe(
          "Outcome and retrospective. What did you do well? What could you do better next time? I ..."
        ),
    }),
    prompt: `
    You are a helpful assistant that extracts the episode from the conversation.
    
    The conversation is a list of messages between a user and an assistant.

    The conversation is:
    ${conversation.join("\n")}

    The episode is a list of thoughts, actions, and results.

    Extract the episode from the conversation: ${conversation.join("\n")}`,
  });

  return {
    id: conversation[0],
    observation: extractEpisode.object.observation,
    thoughts: extractEpisode.object.thoughts,
    action: extractEpisode.object.action,
    result: extractEpisode.object.result,
  };
};

export async function createEpisodeFromWorkingMemory(
  memory: WorkingMemory,
  agent: AnyAgent
): Promise<Episode> {
  // Convert working memory into conversation format for LLM
  const conversation = formatConversation(memory);

  // Generate episodic memory using LLM
  const episodicMemory = await generateEposodicMemory(agent, conversation);

  return {
    id: randomUUIDv7(),
    timestamp: Date.now(),
    observation: episodicMemory.observation,
    thoughts: episodicMemory.thoughts.split("\n"), // Split into array of thoughts
    actions: memory.calls,
    outputs: memory.outputs,
    result: episodicMemory.result,
    metadata: {
      success: memory.results.every((r) => !r.processed),
      tags: extractTags(memory),
    },
  };
}

function formatConversation(memory: WorkingMemory): string[] {
  const conversation: string[] = [];

  // Sort all logs by timestamp
  const logs: Log[] = [
    ...memory.inputs,
    ...memory.outputs,
    ...memory.thoughts,
    ...memory.calls,
    ...memory.results,
  ].sort((a, b) => a.timestamp - b.timestamp);

  // Convert each log into conversation format
  for (const log of logs) {
    switch (log.ref) {
      case "input":
        conversation.push(`User: ${log.formatted || JSON.stringify(log.data)}`);
        break;
      case "output":
        conversation.push(
          `Assistant: ${log.formatted || JSON.stringify(log.data)}`
        );
        break;
      case "thought":
        conversation.push(`Assistant thought: ${log.content}`);
        break;
      case "action_call":
        conversation.push(`Assistant action: ${log.name}(${log.content})`);
        break;
      case "action_result":
        conversation.push(
          `Action result: ${log.formatted || JSON.stringify(log.data)}`
        );
        break;
    }
  }

  return conversation;
}

function extractTags(memory: WorkingMemory): string[] {
  const tags = new Set<string>();

  // Extract tags from inputs
  memory.inputs.forEach((input) => {
    tags.add(input.type);
  });

  // Extract tags from outputs
  memory.outputs.forEach((output) => {
    tags.add(output.type);
  });

  // Extract tags from actions
  memory.calls.forEach((call) => {
    tags.add(call.name);
  });

  return Array.from(tags);
}
