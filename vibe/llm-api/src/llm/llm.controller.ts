import { Controller, Post, Body } from "@nestjs/common";
import { DaydreamsService } from "../daydreams/daydreams.service.js";
import { chatContext } from "../daydreams/context/chat.context.js";

@Controller("llm")
export class LlmController {
  constructor(private readonly daydreamsService: DaydreamsService) {}

  @Post("chat")
  async chat(
    @Body() { sessionId, prompt }: { sessionId: string; prompt: string }
  ) {
    console.log("[DEBUG] Processing chat request:", { sessionId, prompt });

    const response = await this.daydreamsService.send({
      context: chatContext,
      args: { sessionId },
      input: {
        type: "chat",
        data: { sessionId, prompt },
      },
    });

    return { response };
  }

  @Post()
  async sendMessage(@Body() data: any) {
    console.log("[DEBUG] Processing message request:", data);

    try {
      // Validation des données
      if (!data.sessionId) {
        console.log("[DEBUG] No sessionId provided, using default");
        data.sessionId = "default";
      }

      const response = await this.daydreamsService.send({
        context: chatContext,
        args: { sessionId: data.sessionId },
        input: {
          type: "chat",
          data: {
            sessionId: data.sessionId,
            prompt: data.message || "Message vide",
          },
        },
      });

      return response;
    } catch (error) {
      console.error("[ERROR] Error processing message:", error);
      throw new Error(`Processing error: ${error.message}`);
    }
  }
}
