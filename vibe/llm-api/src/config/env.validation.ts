// src/config/env.validation.ts
import { z } from "zod";

export const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_BOT_NAME: z.string().min(1),
  MONGODB_URI: z.string().min(1),
});
