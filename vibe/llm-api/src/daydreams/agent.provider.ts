import { Provider } from '@nestjs/common';
import { createDreams, LogLevel } from '@daydreamsai/core';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

import { chatContext } from './context/chat.context';
import { addToChatHistory, clearChatHistory } from './actions/chat.action';
import { apiInput } from './inputs/chat.input';
import { chatOutput } from './outputs/chat.output';

const env = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
}).parse(process.env);

export const DaydreamsAgentProvider: Provider = {
  provide: 'DAYDREAMS_AGENT',
  useFactory: async () => {
    console.log('[DEBUG] Initialisation du DaydreamsAgent');
    console.log('[DEBUG] API Key présente:', !!env.ANTHROPIC_API_KEY);
    
    const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });
    console.log('[DEBUG] Provider Anthropic créé');

    try {
      console.log('[DEBUG] Création de l\'agent Dreams');
      const agent = await createDreams({
        logger: LogLevel.DEBUG,
        model: anthropic("claude-3-7-sonnet-latest"),
        context: chatContext,
        actions: [addToChatHistory, clearChatHistory],
        inputs: { 
          chat: apiInput 
        },
        outputs: { 
          "chat:response": chatOutput 
        },
        debugger: (contextId, keys, data) => {
          console.log(`[DEBUG] Agent - contextId: ${contextId}, keys: ${keys.join(':')}`, data);
        }
      }).start();
      
      console.log('[DEBUG] Agent Dreams démarré avec succès');
      return agent;
    } catch (error) {
      console.error('[ERROR] Échec de création de l\'agent:', error);
      throw error;
    }
  },
};
