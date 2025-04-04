// src/daydreams/outputs/chat.output.ts
import { output, OutputResponse } from '@daydreamsai/core';
import { z } from 'zod';

export const chatOutput = output({
  name: "chat:response",
  schema: z.object({
    content: z.string().min(1, "Le contenu ne peut pas être vide"),
  }),
  handler: (response, context, agent): OutputResponse => {
    // Si vous devez traiter la réponse avant de la retourner
    console.log("Réponse reçue:", response);
    
    // Retourner un objet compatible avec OutputResponse
    return {
      type: "text",
      value: response.content,
    };
  }
});