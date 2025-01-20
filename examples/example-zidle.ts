import { env } from '../packages/core/src/core/env';
import { LLMClient } from '../packages/core/src/core/llm-client';
import { ChainOfThought } from '../packages/core/src/core/chain-of-thought';
import { ZIDLE_CONTEXT } from './zidle-context-easy';
import { starknetTransactionAction } from '../packages/core/src/core/actions/starknet-transaction';
import { starknetReadAction } from '../packages/core/src/core/actions/starknet-read';
import chalk from 'chalk';
import { JSONSchemaType } from 'ajv';
import { starknetTransactionSchema } from '../packages/core/src/core/validation';
import { config } from 'process';

interface FarmResourcePayload {
  resourceType: 1 | 2;
  duration: number;
}

interface GraphQLPayload {
  query: string;
}

const farmResourceSchema: JSONSchemaType<FarmResourcePayload> = {
  type: 'object',
  properties: {
    resourceType: { type: 'number', enum: [1, 2] },
    duration: { type: 'number', minimum: 1, maximum: 3600 },
  },
  required: ['resourceType', 'duration'],
  additionalProperties: false,
};

const graphqlFetchSchema: JSONSchemaType<GraphQLPayload> = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
  required: ['query'],
  additionalProperties: false,
};

// Ajout des interfaces pour les NFTs
interface CharacterNFT {
  tokenId: number;
  level: number;
  isActive: boolean;
}

interface WalletPayload {
  address: string;
}

interface MintNFTPayload {
  address: string;
  name: string;
}

async function main() {
  // Initialize LLM client
  const llmClient = new LLMClient({
    provider: 'anthropic',
    apiKey: env.ANTHROPIC_API_KEY,
  });

  // Initialize ChainOfThought with zIdle context
  const dreams = new ChainOfThought(
    llmClient,
    {
      worldState: ZIDLE_CONTEXT,
    },
    { chromaUrl: 'http://localhost:8000' }
  );

  dreams.registerAction(
    'CHECK_NFT',
    starknetReadAction,
    {
      description: 'Check if wallet has a character NFT',
      example: JSON.stringify({
        contractAddress: env.NFT_CONTRACT,
        entrypoint: 'token_of_owner_by_index',
        calldata: [env.STARKNET_ADDRESS, 0, 0],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  dreams.registerAction(
    'MINT_NFT',
    starknetTransactionAction,
    {
      description: 'Mint a new character NFT',
      example: JSON.stringify({
        contractAddress:
          '0xaf35f90afa36a49d2bc63e783d0f086e03cd14fe5328fc47bab5e39c60c16b',
        entrypoint: 'create',
        calldata: ['Farmer#123'],
      }),
    },
    starknetTransactionSchema as JSONSchemaType<any>
  );

  // Add event handlers for monitoring
  dreams.on('think:start', ({ query }) => {
    console.log(chalk.blue('\n🤔 Analyzing game state:'), query);
  });

  dreams.on('action:start', (action) => {
    console.log(chalk.yellow('\n🎮 Executing game action:'), {
      type: action.type,
      payload: action.payload,
    });
  });

  dreams.on('action:complete', ({ action, result }) => {
    console.log(chalk.green('\n✅ Action completed:'), {
      type: action.type,
      result,
    });
  });

  dreams.on('action:error', ({ action, error }) => {
    console.log(chalk.red('\n❌ Action failed:'), {
      type: action.type,
      error,
    });
  });

  // Start the AI agent
  try {
    console.log(chalk.cyan('\n🤖 Starting zIdle AI agent...'));

    // Initial analysis
    const result = await dreams.think(
      'Analyze the current game state and determine the optimal farming strategy. Check resource levels and XP progress, then start farming the most needed resource.'
    );

    console.log(chalk.green('\n✨ Initial analysis completed!'));
    console.log('Strategy:', result);

    // Continue monitoring and adjusting strategy
    setInterval(async () => {
      await dreams.think(
        'Review current progress and adjust farming strategy if needed. Consider resource levels, XP gains, and whether we should switch resources.'
      );
    }, 5 * 60 * 1000); // Check every 5 minutes
  } catch (error) {
    console.error(chalk.red('Error running AI agent:'), error);
  }

  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log(chalk.yellow('\nShutting down zIdle AI agent...'));
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
