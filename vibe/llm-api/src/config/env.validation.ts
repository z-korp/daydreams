// src/config/env.validation.ts
import { z } from "zod";

export const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
});
