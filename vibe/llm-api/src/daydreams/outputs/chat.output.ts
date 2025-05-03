// src/daydreams/outputs/chat.output.ts
import { z } from "zod";
import { output } from "@daydreamsai/core";

export const chatOutput = output({
  schema: z.object({
    content: z.string().min(1, "Le contenu ne peut pas être vide"),
  }),
  handler: (response, context, agent): any => {
    // Logs pour le débogage
    console.log(
      "[DEBUG] Output Handler - Response reçue:",
      JSON.stringify(response)
    );
    console.log(
      "[DEBUG] Output Handler - Context:",
      context?.id || "No context"
    );

    // Créer une réponse valide du type OutputResponse
    const outputResponse: any = {
      type: "message", // Utilisez le type correct selon la doc de daydreams
      content: response.content || "Réponse par défaut",
    };

    console.log(
      "[DEBUG] Output Handler - Retourne:",
      JSON.stringify(outputResponse)
    );
    return outputResponse;
  },
});
