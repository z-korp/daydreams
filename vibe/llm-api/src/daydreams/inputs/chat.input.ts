import { input, formatMsg } from "../core-adapter";
import { z } from "zod";
import { chatContext } from "../context/chat.context";

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
