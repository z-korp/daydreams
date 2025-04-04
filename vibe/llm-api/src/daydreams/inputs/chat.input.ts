import { input, formatMsg } from "@daydreamsai/core";
import { z } from "zod";
import { chatContext } from "../context/chat.context";

export const apiInput = input({
  schema: z.object({
    sessionId: z.string(),
    userId: z.string().default('user'),
    prompt: z.string(),
  }),

  format: ({ prompt, userId }) =>
    formatMsg({
      role: "user",
      content: prompt,
      user: userId,
    }),

  subscribe() {
    // Pas besoin d'abonnement pour une API
    return () => {};
  },
});