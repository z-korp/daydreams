import { z } from 'zod';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string(),
  TWITTER_USERNAME: z.string(),
  TWITTER_PASSWORD: z.string(),
  TWITTER_EMAIL: z.string(),
  OPENAI_API_KEY: z.string(),
  CHROMA_URL: z.string().default('http://localhost:8000'),
  STARKNET_RPC_URL: z.string(),
  STARKNET_ADDRESS: z.string(),
  STARKNET_PRIVATE_KEY: z.string(),
  GRAPHQL_URL: z.string(),
  NFT_CONTRACT: z.string(),
});

export const env = envSchema.parse(process.env);
