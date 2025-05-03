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
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createChromaVectorStore } from "@daydreamsai/chromadb";
import { createSupabaseMemoryStore } from "./vendors/supabase.js";
import { chatContext } from "./context/chat.context.js";
import { addToChatHistory, clearChatHistory } from "./actions/chat.action.js";
import { apiInput } from "./inputs/chat.input.js";
import { chatOutput } from "./outputs/chat.output.js";
import { ObjectId } from "mongodb";
import { TemplateService } from "./template.service.js";

type AnthropicModelId = "claude-3-7-sonnet-latest";
type OpenAIModelId = "gpt-4.1" | "gpt-4.1-nano";
type ModelType = "anthropic" | "openai";

export interface AgentResponse {
  ref: string;
  content: string;
  type?: string;
}

export interface AgentRequest {
  context: AnyContext | string;
  args: Record<string, unknown>;
  input: {
    type: string;
    data: Record<string, unknown>;
  };
}

export interface AgentConfig {
  id: string;
  modelType: ModelType;
  modelId: AnthropicModelId | OpenAIModelId;
  contexts: string[]; // IDs of contexts to use
  contextArgs: Record<string, Record<string, unknown>>; // Arguments for each context
}

export interface MessageData {
  content: string;
  [key: string]: unknown;
}

export interface AgentCommunicationChannel {
  sourceAgentId: string;
  targetAgentId: string;
  messageHandler: (message: MessageData) => Promise<void>;
}

// Template de contexte de base
export interface ContextTemplate {
  id: string;
  name: string;
  description: string;
  context: AnyContext;
  defaultArgs?: Record<string, unknown>;
}

@Injectable()
export class DaydreamsService implements OnModuleInit {
  private agents: Map<string, Agent<AnyContext>> = new Map();
  private agentConfigs: Map<string, AgentConfig> = new Map();
  private availableContexts: Map<string, AnyContext> = new Map();
  private contextTemplates: Map<string, ContextTemplate> = new Map();
  private communicationChannels: AgentCommunicationChannel[] = [];
  private model: LanguageModelV1;
  private memory: BaseMemory;

  constructor(
    private configService: ConfigService,
    private templateService: TemplateService
  ) {}

  async onModuleInit() {
    // Register available contexts
    this.registerAvailableContexts();

    // Register context templates
    this.registerContextTemplates();

    // Initialize shared resources (model and memory)
    await this.initializeSharedResources();

    // Initialize default agent
    await this.initializeDefaultAgent();
  }

  private registerAvailableContexts() {
    // Register all available context types
    this.availableContexts.set("chat", chatContext);
    // Add more context types as they become available
    // this.availableContexts.set("workflow", workflowContext);
    // this.availableContexts.set("game", gameContext);
  }

  private registerContextTemplates() {
    // Enregistrer le template de base pour le chat
    const baseChatTemplate: ContextTemplate = {
      id: "base-chat",
      name: "Chat de base",
      description:
        "Un contexte de chat simple pour les conversations générales",
      context: chatContext,
      defaultArgs: {
        sessionId: new ObjectId().toHexString(),
        title: "Conversation générale",
        tags: ["general"],
      },
    };

    // Ajouter le template de base au registre
    this.contextTemplates.set(baseChatTemplate.id, baseChatTemplate);

    // Template de chat pour un assistant de support technique
    const techSupportTemplate: ContextTemplate = {
      id: "tech-support",
      name: "Support Technique",
      description: "Contexte pour un agent de support technique",
      context: chatContext,
      defaultArgs: {
        sessionId: new ObjectId().toHexString(),
        title: "Support Technique",
        tags: ["support", "technique"],
      },
    };

    this.contextTemplates.set(techSupportTemplate.id, techSupportTemplate);

    // Template pour un assistant créatif
    const creativeAssistantTemplate: ContextTemplate = {
      id: "creative-assistant",
      name: "Assistant Créatif",
      description: "Contexte pour un agent assistant dans des tâches créatives",
      context: chatContext,
      defaultArgs: {
        sessionId: new ObjectId().toHexString(),
        title: "Assistant Créatif",
        tags: ["créatif", "brainstorming"],
      },
    };

    this.contextTemplates.set(
      creativeAssistantTemplate.id,
      creativeAssistantTemplate
    );
  }

  private async initializeSharedResources() {
    // Initialize model
    const modelType = "anthropic";
    const modelId = "claude-3-7-sonnet-latest";

    // Initialize model
    if (modelType === "anthropic") {
      const apiKey = this.configService.get<string>("ANTHROPIC_API_KEY");
      if (!apiKey) {
        throw new Error("ANTHROPIC_API_KEY is not defined");
      }
      console.log("[INFO] Initializing Claude model");
      const anthropic = createAnthropic({ apiKey });
      this.model = anthropic(modelId);
    } else if (modelType === "openai") {
      const apiKey = this.configService.get<string>("OPENAI_API_KEY");
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not defined");
      }
      const openai = createOpenAI({ apiKey });
      this.model = openai(modelId as OpenAIModelId);
    } else {
      throw new Error(
        `Invalid model configuration: ${modelType} - ${modelId as string}`
      );
    }

    // Initialize memory
    const backend =
      this.configService.get<string>("MEMORY_BACKEND") ?? "chroma";
    if (backend === "supabase") {
      console.log("[INFO] Using Supabase memory backend");
      const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
      const supabaseApiKey = this.configService.get<string>("SUPABASE_API_KEY");
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
      this.memory = createMemory(
        supabaseStore,
        createChromaVectorStore("agent-episodes")
      );
    } else {
      console.log("[INFO] Using in-memory store with Chroma vector backend");
      this.memory = createMemory(
        createMemoryStore(),
        createChromaVectorStore("agent-episodes")
      );
    }
  }

  private async initializeDefaultAgent() {
    const defaultAgentId = new ObjectId().toHexString();
    const defaultConfig: AgentConfig = {
      id: defaultAgentId,
      modelType: "anthropic",
      modelId: "claude-3-7-sonnet-latest",
      contexts: ["chat"],
      contextArgs: {
        chat: {
          sessionId: new ObjectId().toHexString(),
          userId: "default-user",
        },
      },
    };

    await this.createAgent(defaultConfig);
    console.log("[INFO] Default agent created with ID:", defaultAgentId);
  }

  async createAgent(config: AgentConfig): Promise<string> {
    try {
      console.log(`[INFO] Creating agent with ID: ${config.id}`);

      // Validate that all requested contexts exist
      for (const contextId of config.contexts) {
        if (!this.availableContexts.has(contextId)) {
          throw new Error(`Unknown context: ${contextId}`);
        }
      }

      // Get context objects with their arguments
      const contextInstances = config.contexts.map((contextId) => {
        const context = this.availableContexts.get(contextId);
        const args = config.contextArgs[contextId] || {};
        return { context, args };
      });

      // Create the agent
      const dreams = createDreams({
        logger: LogLevel.DEBUG,
        model: this.model,
        memory: this.memory,
        contexts: contextInstances.map((c) => c.context),
        inputs: { chat: apiInput },
        outputs: { "chat:response": chatOutput },
        actions: [addToChatHistory, clearChatHistory] as Action<
          any,
          any,
          unknown,
          AnyContext,
          Agent<any>,
          Memory<any>
        >[],
        debugger: (contextId, keys, data) => {
          console.log(
            `[DEBUG] Agent ${config.id} - contextId: ${contextId}, keys: ${keys.join(":")}`,
            data
          );
        },
      });

      // Start the agent with the first context's arguments
      const firstContextArgs = config.contextArgs[config.contexts[0]] || {};
      const agent = (await dreams.start(firstContextArgs)) as Agent<AnyContext>;

      // Store the agent and its configuration
      this.agents.set(config.id, agent);
      this.agentConfigs.set(config.id, config);

      console.log(`[SUCCESS] Agent ${config.id} created and started`);
      return config.id;
    } catch (error) {
      console.error(`[ERROR] Failed to create agent ${config.id}:`, error);
      throw error;
    }
  }

  async send(agentId: string, request: AgentRequest): Promise<AgentResponse[]> {
    const agent = this.agents.get(agentId);

    if (!agent) {
      console.warn(
        `[WARN] Agent ${agentId} not found, returning error response`
      );
      return [
        {
          ref: "output",
          content: `Agent ${agentId} not found`,
          type: "error",
        },
      ];
    }

    try {
      console.log(`[DEBUG] Sending request to agent ${agentId}:`, request);

      // If context is a string, try to get the actual context object
      if (typeof request.context === "string") {
        const contextObj = this.availableContexts.get(request.context);
        if (contextObj) {
          request = {
            ...request,
            context: contextObj,
          };
        } else {
          throw new Error(`Context ${request.context} not found`);
        }
      }

      // TypeScript Fix: Create a properly typed request object for agent.send
      const typedRequest = {
        context: request.context as AnyContext, // Now we're sure this is AnyContext
        args: request.args,
        input: request.input,
      };

      const response = await agent.send(typedRequest);
      console.log(`[DEBUG] Agent ${agentId} response:`, response);
      return response as AgentResponse[];
    } catch (error) {
      console.error(`[ERROR] Error in agent.send for ${agentId}:`, error);
      return [
        {
          ref: "output",
          content: "Error processing request",
          type: "error",
        },
      ];
    }
  }

  async createCommunicationChannel(
    sourceAgentId: string,
    targetAgentId: string
  ): Promise<boolean> {
    // Verify both agents exist
    if (!this.agents.has(sourceAgentId) || !this.agents.has(targetAgentId)) {
      console.error(
        `[ERROR] Cannot create communication channel: one or both agents do not exist`
      );
      return false;
    }

    // Create the message handler
    const messageHandler = async (message: MessageData): Promise<void> => {
      // We need at least one await operation
      await Promise.resolve();

      console.log(
        `[DEBUG] Message from ${sourceAgentId} to ${targetAgentId}:`,
        message
      );

      // More message handling logic can be added here
    };

    // Make sure we have at least one await operation to satisfy the linter
    await Promise.resolve();

    // Create the communication channel
    this.communicationChannels.push({
      sourceAgentId,
      targetAgentId,
      messageHandler,
    });

    console.log(
      `[INFO] Created communication channel from ${sourceAgentId} to ${targetAgentId}`
    );
    return true;
  }

  async sendMessageBetweenAgents(
    sourceAgentId: string,
    targetAgentId: string,
    message: MessageData
  ): Promise<boolean> {
    // Find the appropriate communication channel
    const channel = this.communicationChannels.find(
      (c) =>
        c.sourceAgentId === sourceAgentId && c.targetAgentId === targetAgentId
    );

    if (!channel) {
      console.error(
        `[ERROR] No communication channel exists from ${sourceAgentId} to ${targetAgentId}`
      );
      return false;
    }

    // Send the message through the channel
    await channel.messageHandler(message);
    return true;
  }

  getAvailableContexts(): string[] {
    return Array.from(this.availableContexts.keys());
  }

  getAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  getAgentConfig(agentId: string): AgentConfig | null {
    return this.agentConfigs.get(agentId) || null;
  }

  private isAnthropicModel(modelId: string): modelId is AnthropicModelId {
    return modelId.startsWith("claude-");
  }

  private isOpenAIModel(modelId: string): modelId is OpenAIModelId {
    return modelId.startsWith("gpt-");
  }

  // Méthode pour créer un agent basé sur un template de contexte
  async createAgentFromTemplate(
    templateId: string,
    config: Omit<AgentConfig, "contexts" | "contextArgs">,
    customArgs?: Record<string, unknown>
  ): Promise<string> {
    // Vérifier si le template existe
    const template = this.contextTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template de contexte '${templateId}' non trouvé`);
    }

    // Get the context type from the template
    const contextType = template.context.type;

    // Verify that the context type is registered
    if (!this.availableContexts.has(contextType)) {
      throw new Error(`Unknown context: ${contextType}`);
    }

    // Fusionner les arguments par défaut avec les arguments personnalisés
    const contextArgs = {
      [contextType]: {
        ...template.defaultArgs,
        ...customArgs,
        // Assurer que sessionId est toujours unique s'il n'est pas fourni
        sessionId: customArgs?.sessionId || new ObjectId().toHexString(),
      },
    };

    // Créer la configuration complète de l'agent
    const fullConfig: AgentConfig = {
      ...config,
      contexts: [contextType],
      contextArgs,
    };

    // Créer l'agent avec la configuration
    return this.createAgent(fullConfig);
  }

  // Obtenir tous les templates de contexte disponibles
  getContextTemplates(): ContextTemplate[] {
    return Array.from(this.contextTemplates.values());
  }

  // Obtenir un template de contexte spécifique
  getContextTemplate(templateId: string): ContextTemplate | null {
    return this.contextTemplates.get(templateId) || null;
  }

  // Créer un nouveau template de contexte personnalisé
  createContextTemplate(template: ContextTemplate): string {
    // Vérifier si le contexte référencé existe
    if (!this.availableContexts.has(template.context.type)) {
      throw new Error(
        `Le type de contexte '${template.context.type}' n'existe pas`
      );
    }

    // Enregistrer le template
    this.contextTemplates.set(template.id, template);
    return template.id;
  }

  // Ajouter une nouvelle méthode pour créer un agent avec un template
  async createAgentWithTemplate(
    templateId: string,
    variables: Record<string, string>,
    config: Omit<AgentConfig, "contexts" | "contextArgs">
  ): Promise<string> {
    try {
      console.log(`[INFO] Creating agent with template ${templateId}`);

      // Vérifier si le template existe
      const templateContent = this.templateService.renderTemplate(
        templateId,
        variables
      );
      if (!templateContent) {
        throw new Error(`Template '${templateId}' not found`);
      }

      // Déterminer quel contexte utiliser (par défaut, on utilise "chat")
      const contextType = "chat";
      if (!this.availableContexts.has(contextType)) {
        throw new Error(`Context type '${contextType}' does not exist`);
      }

      // Créer les arguments de contexte
      const contextArgs = {
        [contextType]: {
          sessionId: new ObjectId().toHexString(),
          userId: variables.userId || "user",
          prompt: templateContent, // Utiliser le template comme prompt
          // Ajouter d'autres variables comme arguments de contexte
          ...Object.keys(variables).reduce(
            (acc, key) => {
              acc[key] = variables[key];
              return acc;
            },
            {} as Record<string, string>
          ),
        },
      };

      // Créer la configuration complète de l'agent
      const fullConfig: AgentConfig = {
        ...config,
        contexts: [contextType],
        contextArgs,
      };

      // Créer l'agent avec la configuration
      return this.createAgent(fullConfig);
    } catch (error) {
      console.error(
        `[ERROR] Failed to create agent with template ${templateId}:`,
        error
      );
      throw error;
    }
  }
}
