import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createDreams, LogLevel } from "@daydreamsai/core";
import { createAnthropic } from "@ai-sdk/anthropic";
import { chatContext } from "./context/chat.context.js";
import { addToChatHistory, clearChatHistory } from "./actions/chat.action.js";
import { apiInput } from "./inputs/chat.input.js";
import { chatOutput } from "./outputs/chat.output.js";

@Injectable()
export class DaydreamsService implements OnModuleInit {
  private agent: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      const apiKey = this.configService.get<string>("ANTHROPIC_API_KEY");
      const anthropic = createAnthropic({ apiKey });

      console.log("[DEBUG] Initializing Daydreams agent...");

      const dreams = createDreams({
        logger: LogLevel.DEBUG,
        model: anthropic("claude-3-7-sonnet-latest"),
        context: chatContext,
        actions: [addToChatHistory, clearChatHistory],
        inputs: {
          chat: apiInput,
        },
        outputs: {
          "chat:response": chatOutput,
        },
        debugger: (contextId, keys, data) => {
          console.log(
            `[DEBUG] Agent - contextId: ${contextId}, keys: ${keys.join(":")}`,
            data
          );
        },
      });

      this.agent = await dreams.start({ sessionId: "default-session" });
      console.log("[SUCCESS] Daydreams agent started successfully");
    } catch (error) {
      console.error("[ERROR] Failed to initialize Daydreams agent:", error);
    }
  }

  async send(request: any) {
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
      return response;
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
