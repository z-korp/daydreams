import type { ActionHandler } from "../../../packages/core/src/types";
import { LLMClient } from "../../../packages/core/src/core/llm-client";

export const analysisTweetAction: ActionHandler = async (action, chain) => {
  const { content } = action.payload ?? {};
  
  if (!content) {
    throw new Error("Tweet content is required");
  }

  const llmClient = new LLMClient({
    model: "deepseek/deepseek-r1",
  });

  const analysis = await llmClient.analyze(
    `
    Analyze this tweet and provide insights about:
    1. Tone (formal, casual, etc.)
    2. Purpose (inform, engage, promote, etc.)
    3. Key topics or themes
    4. Writing style characteristics
    5. Engagement potential

    Tweet: "${content}"
    `,
    {
      system: "You are a tweet analyst. Provide concise, structured analysis of tweets.",
      temperature: 0.3
    }
  );

  return JSON.stringify({
    content,
    analysis,
    timestamp: new Date().toISOString()
  });
};
