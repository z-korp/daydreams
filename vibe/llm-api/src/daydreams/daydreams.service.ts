import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  createDreams,
  LogLevel,
  Agent,
  Action,
  AnyContext,
  Memory,
  LanguageModelV1,
  BaseMemory,
  createMemory,
  createMemoryStore,
} from "@daydreamsai/core";
import { createChromaVectorStore } from "@daydreamsai/chromadb";
import { createMongoMemoryStore } from "@daydreamsai/mongodb";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { chatContext } from "./context/chat.context.js";
import { addToChatHistory, clearChatHistory } from "./actions/chat.action.js";
import { apiInput } from "./inputs/chat.input.js";
import { chatOutput } from "./outputs/chat.output.js";
import { ObjectId } from "mongodb";

type AnthropicModelId = "claude-3-7-sonnet-latest";
type OpenAIModelId = "gpt-4.1" | "gpt-4.1-nano";
type ModelType = "anthropic" | "openai";

export interface AgentResponse {
  ref: string;
  content: string;
  type?: string;
}

interface AgentRequest {
  context: AnyContext;
  args: Record<string, unknown>;
  input: {
    type: string;
    data: Record<string, unknown>;
  };
}

@Injectable()
export class DaydreamsService implements OnModuleInit {
  private agent: Agent<AnyContext>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeAgent("openai", "gpt-4.1-nano");
  }

  private async initializeAgent(
    modelType: ModelType,
    modelId: AnthropicModelId | OpenAIModelId
  ) {
    try {
      // === 1. Init modèle ===
      let model: LanguageModelV1;
      if (modelType === "anthropic" && this.isAnthropicModel(modelId)) {
        const apiKey = this.configService.get<string>("ANTHROPIC_API_KEY");
        const anthropic = createAnthropic({ apiKey });
        model = anthropic(modelId);
      } else if (modelType === "openai" && this.isOpenAIModel(modelId)) {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY");
        const openai = createOpenAI({ apiKey });
        model = openai(modelId);
      } else {
        throw new Error(
          `Invalid model configuration: ${modelType} - ${modelId}`
        );
      }

      // === 2. Configuration mémoire ===
      const backend =
        this.configService.get<string>("MEMORY_BACKEND") ?? "chroma";
      let memory: BaseMemory;

      if (backend === "mongo") {
        console.log("[INFO] Using MongoDB memory backend");
        const mongoStore = await createMongoMemoryStore({
          uri: this.configService.get<string>("MONGODB_URI"),
          dbName: "daydreams",
        });
        memory = createMemory(
          mongoStore,
          createChromaVectorStore("agent-episodes")
        );
      } else {
        console.log("[INFO] Using in-memory store with Chroma vector backend");
        memory = createMemory(
          createMemoryStore(),
          createChromaVectorStore("agent-episodes")
        );
      }

      // === 3. Création agent ===
      const dreams = createDreams({
        logger: LogLevel.DEBUG,
        model,
        memory,
        context: chatContext,
        actions: [addToChatHistory, clearChatHistory] as Action<
          any,
          any,
          unknown,
          AnyContext,
          Agent<any>,
          Memory<any>
        >[],
        inputs: { chat: apiInput },
        outputs: { "chat:response": chatOutput },
        debugger: (contextId, keys, data) => {
          console.log(
            `[DEBUG] Agent - contextId: ${contextId}, keys: ${keys.join(":")}`,
            data
          );
        },
      });

      const sessionId = new ObjectId().toHexString();
      console.log("[DEBUG] sessionId:", sessionId);

      this.agent = (await dreams.start({ sessionId })) as Agent<AnyContext>;
      console.log("[SUCCESS] Daydreams agent started");
    } catch (error) {
      console.error("[ERROR] Failed to initialize agent:", error);
      throw error;
    }
  }

  private isAnthropicModel(modelId: string): modelId is AnthropicModelId {
    return modelId.startsWith("claude-");
  }

  private isOpenAIModel(modelId: string): modelId is OpenAIModelId {
    return modelId.startsWith("gpt-");
  }

  async send(request: AgentRequest): Promise<AgentResponse[]> {
    if (!this.agent) {
      console.warn("[WARN] Agent not initialized, returning error response");
      return [
        {
          ref: "output",
          content: "Agent not initialized",
          type: "error",
        },
      ];
    }

    try {
      console.log("[DEBUG] Sending request to agent:", request);
      const response = await this.agent.send(request);
      console.log("[DEBUG] Agent response:", response);
      return response as AgentResponse[];
    } catch (error) {
      console.error("[ERROR] Error in agent.send:", error);
      return [
        {
          ref: "output",
          content: "Error processing request",
          type: "error",
        },
      ];
    }
  }
}
