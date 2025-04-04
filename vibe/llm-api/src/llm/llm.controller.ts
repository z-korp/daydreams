import { Controller, Post, Body } from '@nestjs/common';
import { LlmService } from './llm.service';

@Controller('llm')
export class LlmController {
  constructor(private readonly llmService: LlmService) {}

  @Post('chat')
  async chat(@Body() { sessionId, prompt }: { sessionId: string, prompt: string }) {
    const response = await this.llmService.ask(sessionId, prompt);
    console.log('================================================     response', response);
    return { response };
  }

  @Post()
  async sendMessage(@Body() data: any) {
    try {
      console.log('================================================     data', data);
      // Assurez-vous que sessionId existe toujours
      if (!data.sessionId) {
        data.sessionId = 'default';
      }
      
      const response = await this.llmService.ask(data.sessionId, data.message || "Bonjour");
      console.log('================================================     response', response);
      return response;
    } catch (error) {
      console.error("Erreur:", error);
      throw new Error(`Erreur de traitement: ${error.message}`);
    }
  }
}
