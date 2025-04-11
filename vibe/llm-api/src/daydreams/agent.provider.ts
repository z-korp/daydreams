import { Provider } from "@nestjs/common";
import { createDreams, LogLevel } from "./core-adapter";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { ConfigService } from "@nestjs/config";

import { chatContext } from "./context/chat.context";
import { addToChatHistory, clearChatHistory } from "./actions/chat.action";
import { apiInput } from "./inputs/chat.input";
import { chatOutput } from "./outputs/chat.output";

export const DaydreamsAgentProvider: Provider = {
  provide: "DAYDREAMS_AGENT",
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const apiKey = configService.get<string>("ANTHROPIC_API_KEY");

    console.log("[DEBUG] Initialisation du DaydreamsAgent");

    const anthropic = createAnthropic({ apiKey: apiKey });
    console.log("[DEBUG] Provider Anthropic créé");

    try {
      console.log("[DEBUG] Création de l'agent Dreams");
      const agent = await createDreams({
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
      }).start({
        sessionId: "default-session",
      });

      console.log("[DEBUG] Agent Dreams démarré avec succès");
      return agent;
    } catch (error) {
      console.error("[ERROR] Échec de création de l'agent:", error);
      throw error;
    }
  },
};
