// src/config/config.ts
import { envSchema } from "./env.validation.js";

export const validateEnv = (config: Record<string, any>) => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
};
