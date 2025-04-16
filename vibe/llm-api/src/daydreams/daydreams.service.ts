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
import { createSupabaseMemoryStore } from "./vendors/supabase.js";
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
    await this.initializeAgent("anthropic", "claude-3-7-sonnet-latest");
  }

  private async initializeAgent(
    modelType: ModelType,
    modelId: AnthropicModelId | OpenAIModelId
  ) {
    try {
      // === 1. Initialize model ===
      let model: LanguageModelV1;
      if (modelType === "anthropic" && this.isAnthropicModel(modelId)) {
        const apiKey = this.configService.get<string>("ANTHROPIC_API_KEY");
        if (!apiKey) {
          throw new Error("ANTHROPIC_API_KEY is not defined");
        }
        console.log("[INFO] Initializing Claude model");
        const anthropic = createAnthropic({ apiKey });
        model = anthropic(modelId);
      } else if (modelType === "openai" && this.isOpenAIModel(modelId)) {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY");
        if (!apiKey) {
          throw new Error("OPENAI_API_KEY is not defined");
        }
        const openai = createOpenAI({ apiKey });
        model = openai(modelId);
      } else {
        throw new Error(
          `Invalid model configuration: ${modelType} - ${modelId}`
        );
      }

      // === 2. Memory configuration ===
      const backend =
        this.configService.get<string>("MEMORY_BACKEND") ?? "chroma";
      let memory: BaseMemory;

      if (backend === "supabase") {
        console.log("[INFO] Using Supabase memory backend");
        const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
        const supabaseApiKey =
          this.configService.get<string>("SUPABASE_API_KEY");
        const supabaseTable =
          this.configService.get<string>("SUPABASE_TABLE") || "conversations";
        if (!supabaseUrl || !supabaseApiKey) {
          throw new Error("SUPABASE_URL or SUPABASE_API_KEY is not defined");
        }
        const supabaseStore = await createSupabaseMemoryStore({
          url: supabaseUrl,
          apiKey: supabaseApiKey,
          tableName: supabaseTable,
        });
        memory = createMemory(
          supabaseStore,
          createChromaVectorStore("agent-episodes")
        );
      } else {
        console.log("[INFO] Using in-memory store with Chroma vector backend");
        memory = createMemory(
          createMemoryStore(),
          createChromaVectorStore("agent-episodes")
        );
      }

      // === 3. Initialize agent ===
      const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
      const supabaseApiKey = this.configService.get<string>("SUPABASE_API_KEY");
      const supabaseTable =
        this.configService.get<string>("SUPABASE_TABLE") || "conversations";
      const dreams = createDreams({
        logger: LogLevel.DEBUG,
        model,
        memory: createMemory(
          await createSupabaseMemoryStore({
            url: supabaseUrl!,
            apiKey: supabaseApiKey!,
            tableName: supabaseTable,
          }),
          createChromaVectorStore("my-agent-apisodes")
        ),
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
