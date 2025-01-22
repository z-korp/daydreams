import { LLMClient } from "./llm-client";
import { Logger } from "./logger";
import { type ProcessedIntent } from "./processor";
import { LogLevel } from "../types";
export interface Intent {
  type: string;
  confidence: number;
  parameters?: Record<string, any>;
}

export interface IntentExtractor {
  extract(content: string, prompt?: string): Promise<ProcessedIntent[]>;
}

export class LLMIntentExtractor implements IntentExtractor {
  private logger: Logger;

  constructor(
    private llmClient: LLMClient,
    logLevel: LogLevel = LogLevel.INFO
  ) {
    this.logger = new Logger({
      level: logLevel,
      enableColors: true,
      enableTimestamp: true,
    });
  }

  async extract(content: string): Promise<Intent[]> {
    this.logger.debug("LLMIntentExtractor.extract", "Extracting intents", {
      contentLength: content.length,
    });
    try {
      const prompt = `
        You are an intent classification system. Your task is to analyze content and identify the underlying user intents with high precision.

        RULES:
        - Identify ALL possible intents present in the content
        - Each intent must have a specific, well-defined type
        - Assign realistic confidence scores (0-1) based on clarity/certainty
        - Include relevant contextual parameters that could help fulfill the intent
        - Common intent types: question, statement, request, greeting, opinion, etc.

        Content to analyze: "${content}"

        RESPOND WITH A JSON ARRAY ONLY. Format:

        [
          {
            "type": "intent_type",
            "confidence": 0.0-1.0,
            "parameters": {
              "topic": "domain/subject",
              "target": "who/what this is directed at",
              "urgency": "low|medium|high",
              "sentiment": "positive|negative|neutral",
            }
          }
        ]

        Remember to:
        1. Be precise with intent types
        2. Include ALL detected intents
        3. Add detailed parameters
        4. Use realistic confidence scores
        5. Return ONLY valid JSON`;

      const response = await this.llmClient.complete(prompt);

      // Try to extract JSON from the response text
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const intents = JSON.parse(jsonMatch[0]) as Intent[];

      // Validate the structure of each intent
      return intents.map((intent) => ({
        type: String(intent.type),
        confidence: Number(intent.confidence),
        parameters: intent.parameters || {},
      }));
    } catch (error) {
      this.logger.error(
        "LLMIntentExtractor.extract",
        "Failed to extract intents",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      // Return a fallback intent when parsing fails
      return [
        {
          type: "unknown",
          confidence: 0.1,
          parameters: {
            originalContent: content,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      ];
    }
  }

  async train(
    examples: Array<{ content: string; intents: Intent[] }>
  ): Promise<void> {
    this.logger.info("LLMIntentExtractor.train", "Training intent extractor", {
      exampleCount: examples.length,
    });

    const prompt = `
You are being trained to identify intents in messages. Study these examples:

${examples
  .map(
    (ex) => `
Message: "${ex.content}"
Intents: ${JSON.stringify(ex.intents, null, 2)}
`
  )
  .join("\n")}

Analyze the patterns and update your understanding accordingly.
`;

    try {
      this.logger.debug("LLMIntentExtractor.train", "Sending training prompt");
      await this.llmClient.analyze(prompt, {
        system:
          "You are a analysis expert that extracts intents from messages.",
        role: "intent analysis trainer",
        temperature: 0.2,
        formatResponse: true,
      });
      this.logger.info(
        "LLMIntentExtractor.train",
        "Training completed successfully"
      );
    } catch (error) {
      this.logger.error(
        "LLMIntentExtractor.train",
        "Failed to train intent extractor",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }
}
