import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDreams, LogLevel } from "@daydreamsai/core";
import { chatContext } from "./context/chat.context.js";
import { addToChatHistory, clearChatHistory } from "./actions/chat.action.js";
import { apiInput } from "./inputs/chat.input.js";
import { chatOutput } from "./outputs/chat.output.js";

export const DaydreamsAgentProvider: Provider = {
  provide: "DAYDREAMS_AGENT",
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const apiKey = configService.get<string>("ANTHROPIC_API_KEY");

    console.log("[DEBUG] Initialisation du DaydreamsAgent");

    try {
      const anthropic = createAnthropic({ apiKey });
      console.log("[DEBUG] Provider Anthropic créé");

      console.log("[DEBUG] Création de l'agent Dreams");

      // Création de l'agent avec createDreams (fonction asynchrone)
      const dreamsInstance = await createDreams({
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

      // Démarrer l'agent
      const agent = await dreamsInstance.start({
        sessionId: "default-session",
      });

      console.log("[DEBUG] Agent Dreams démarré avec succès");
      return agent;
    } catch (error) {
      console.error("[ERROR] Échec de création de l'agent:", error);
      // En cas d'erreur, retourner un agent de secours avec méthode send
      return {
        send: async (request: any) => {
          console.log("[FALLBACK] Utilisation de l'agent de secours");
          return [
            {
              ref: "output",
              content:
                "Le système rencontre des difficultés. Veuillez réessayer plus tard.",
              type: "error",
            },
          ];
        },
      };
    }
  },
};
