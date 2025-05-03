import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import {
  DaydreamsService,
  AgentConfig,
  AgentResponse,
} from "./daydreams.service.js";

// DTO for creating a new agent
export class CreateAgentDto {
  id?: string; // Optional, a random ID will be generated if not provided
  modelType: "anthropic" | "openai";
  modelId: string;
  contexts: string[];
  contextArgs: Record<string, Record<string, unknown>>;
}

// DTO for sending a message to an agent
export class SendMessageDto {
  contextId: string;
  message: string;
  userId?: string;
  input?: {
    type?: string;
    data?: Record<string, unknown>;
  };
}

// DTO for connecting two agents
export class ConnectAgentsDto {
  sourceAgentId: string;
  targetAgentId: string;
}

// DTO for agent-to-agent messaging
export class AgentMessageDto {
  sourceAgentId: string;
  targetAgentId: string;
  content: string;
}

@Controller("daydreams")
export class DaydreamsController {
  constructor(private readonly daydreamsService: DaydreamsService) {}

  // Get available contexts
  @Get("contexts")
  getAvailableContexts() {
    return {
      contexts: this.daydreamsService.getAvailableContexts(),
    };
  }

  // Get all agents
  @Get("agents")
  getAgents() {
    const agentIds = this.daydreamsService.getAgentIds();
    const agents = agentIds.map((id) => {
      return {
        id,
        config: this.daydreamsService.getAgentConfig(id),
      };
    });

    return { agents };
  }

  // Get a specific agent
  @Get("agents/:id")
  getAgent(@Param("id") agentId: string) {
    const config = this.daydreamsService.getAgentConfig(agentId);
    if (!config) {
      return { error: `Agent ${agentId} not found` };
    }

    return { agent: { id: agentId, config } };
  }

  // Create a new agent
  @Post("agents")
  async createAgent(@Body() dto: CreateAgentDto) {
    try {
      // Generate an ID if not provided
      const agentId =
        dto.id ||
        `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const config: AgentConfig = {
        id: agentId,
        modelType: dto.modelType,
        modelId:
          dto.modelType === "anthropic"
            ? "claude-3-7-sonnet-latest"
            : dto.modelId === "gpt-4.1" || dto.modelId === "gpt-4.1-nano"
              ? dto.modelId
              : "gpt-4.1", // Default to gpt-4.1 if invalid
        contexts: dto.contexts,
        contextArgs: dto.contextArgs,
      };

      const createdId = await this.daydreamsService.createAgent(config);
      return {
        success: true,
        agentId: createdId,
        message: `Agent ${createdId} created successfully`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to create agent",
      };
    }
  }

  // Send a message to an agent
  @Post("agents/:id/send")
  async sendMessage(@Param("id") agentId: string, @Body() dto: SendMessageDto) {
    try {
      // Get context from available contexts
      const contextExists = this.daydreamsService
        .getAvailableContexts()
        .includes(dto.contextId);

      if (!contextExists) {
        return {
          success: false,
          error: `Context ${dto.contextId} not found`,
        };
      }

      // Get agent config
      const config = this.daydreamsService.getAgentConfig(agentId);
      if (!config) {
        return {
          success: false,
          error: `Agent ${agentId} not found`,
        };
      }

      // Get context args from agent config or use default
      const contextArgs = config.contextArgs[dto.contextId] || {};

      // Create request - note that context is now a string and the service will resolve it
      const request = {
        context: dto.contextId,
        args: contextArgs,
        input: {
          type: "chat",
          data: dto.input?.data || {
            message: dto.message,
            sender: dto.userId || "user",
          },
        },
      };

      // Send request to agent
      const response = await this.daydreamsService.send(agentId, request);

      return {
        success: true,
        response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to send message",
      };
    }
  }

  // Create a communication channel between two agents
  @Post("agents/connect")
  async connectAgents(@Body() dto: ConnectAgentsDto) {
    try {
      const success = await this.daydreamsService.createCommunicationChannel(
        dto.sourceAgentId,
        dto.targetAgentId
      );

      if (success) {
        return {
          success: true,
          message: `Communication channel created from ${dto.sourceAgentId} to ${dto.targetAgentId}`,
        };
      } else {
        return {
          success: false,
          error: "Failed to create communication channel",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to connect agents",
      };
    }
  }

  // Send a message from one agent to another
  @Post("agents/message")
  async sendAgentMessage(@Body() dto: AgentMessageDto) {
    try {
      const success = await this.daydreamsService.sendMessageBetweenAgents(
        dto.sourceAgentId,
        dto.targetAgentId,
        { content: dto.content }
      );

      if (success) {
        return {
          success: true,
          message: `Message sent from ${dto.sourceAgentId} to ${dto.targetAgentId}`,
        };
      } else {
        return {
          success: false,
          error: "Failed to send message between agents",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Failed to send message",
      };
    }
  }
}
