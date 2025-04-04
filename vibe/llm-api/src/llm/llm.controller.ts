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
  console.log('[DEBUG] Controller - Requête reçue:', JSON.stringify(data));
  
  try {
    // Validation des données
    if (!data.sessionId) {
      console.log('[DEBUG] Controller - sessionId manquant, utilisation de la valeur par défaut');
      data.sessionId = 'default';
    }
    
    console.log('[DEBUG] Controller - Appel de l\'agent avec:', {
      sessionId: data.sessionId,
      prompt: data.message || "Message vide"
    });
    
    const response = await this.llmService.ask(
      data.sessionId,
      data.message || "Message vide"
    );
    
    console.log('[DEBUG] Controller - Réponse reçue de l\'agent:', JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('[ERROR] Controller - Erreur:', error);
    throw new Error(`Erreur de traitement: ${error.message}`);
  }
}
}
