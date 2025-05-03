import { input, formatMsg } from "@daydreamsai/core";
import { z } from "zod";
import { chatContext } from "../context/chat.context.js";

export const apiInput = input({
  schema: z.object({
    sessionId: z.string(),
    userId: z.string().default("user"),
    prompt: z.string(),
  }),

  format: (inputRef) =>
    formatMsg({
      role: "user",
      content: inputRef.data.prompt,
      user: inputRef.data.userId,
    }),

  subscribe() {
    // Pas besoin d'abonnement pour une API
    return () => {};
  },
});
