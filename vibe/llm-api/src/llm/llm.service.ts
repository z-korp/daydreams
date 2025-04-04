import { Injectable, Inject } from '@nestjs/common';
import { agent } from '../daydreams/agent';
import { chatContext } from '../daydreams/context/chat.context';
import { createDreams } from '@daydreamsai/core';

@Injectable()
export class LlmService {
  constructor(@Inject('DAYDREAMS_AGENT') private readonly agent: Awaited<ReturnType<typeof createDreams>>) {}

  async ask(sessionId: string, prompt: string, userId = 'user') {
    try {
      const responseLogs = await this.agent.send({
        context: chatContext,
        args: { sessionId },
        input: {
          type: 'chat',
          data: { sessionId, userId, prompt },
        },
      });

      // Recherche dans les logs de réponse
      const response = responseLogs.find(log => log.ref === 'output');
      console.log('================================================     SERVICE', response);
      console.log('================================================     CONTENT', response?.content);
      // Accès sécurisé aux propriétés
      return {
        content: response?.content || "Aucune réponse générée.",
        sessionId,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error processing request:', error);
      return {
        content: "Une erreur est survenue lors du traitement de la demande.",
        error: error instanceof Error ? error.message : String(error),
        sessionId,
        timestamp: Date.now(),
      };
    }
  }
}
