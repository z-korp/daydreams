import { env } from '../packages/core/src/core/env';
import { LLMClient } from '../packages/core/src/core/llm-client';
import { ChainOfThought } from '../packages/core/src/core/chain-of-thought';
import { ZIDLE_CONTEXT } from './zidle-context-easy';
import * as readline from 'readline';
import chalk from 'chalk';
import { JSONSchemaType } from 'ajv';

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

// Définir un schéma pour l'action CONNECT_WALLET
const connectWalletSchema: JSONSchemaType<any> = {
  type: 'object',
  properties: {},
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

// Ajout des schémas
const mintNFTSchema: JSONSchemaType<MintNFTPayload> = {
  type: 'object',
  properties: {
    address: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['address', 'name'],
  additionalProperties: false,
};

const walletSchema: JSONSchemaType<WalletPayload> = {
  type: 'object',
  properties: {
    address: { type: 'string' },
  },
  required: ['address'],
  additionalProperties: false,
};

// Mock actions (replace with actual game API calls)
const farmResourceAction = async (payload: any) => {
  const { resourceType, duration } = payload;
  const result = {
    success: true,
    resourceGained: Math.floor(Math.random() * 100 * duration),
    xpGained: Math.floor(duration * 1.5),
  };
  return JSON.stringify(result);
};

const graphqlAction = async (payload: any) => {
  const result = {
    resources: [
      {
        type: 1,
        amount: Math.floor(Math.random() * 2000),
        farmingRate: 1,
        xpLevel: Math.floor(Math.random() * 5) + 1,
        xpProgress: Math.floor(Math.random() * 100),
      },
      {
        type: 2,
        amount: Math.floor(Math.random() * 2000),
        farmingRate: 1,
        xpLevel: Math.floor(Math.random() * 5) + 1,
        xpProgress: Math.floor(Math.random() * 100),
      },
    ],
  };
  return JSON.stringify(result);
};

const connectWalletAction = async () => {
  const wallet = {
    success: true,
    address: env.WALLET_ADDRESS || '0x...' + Math.random().toString(16).substring(2, 8),
  };
  return JSON.stringify(wallet);
};

// Ajout des actions mock
const mintNFTAction = async (payload: MintNFTPayload) => {
  const nft = {
    success: true,
    tokenId: Math.floor(Math.random() * 1000),
    name: payload.name,
    owner: env.WALLET_ADDRESS,
    contract: env.NFT_CONTRACT,
  };
  return JSON.stringify(nft);
};

const checkNFTAction = async (payload: WalletPayload) => {
  const hasNFT = Math.random() > 0.5;
  return JSON.stringify({
    hasNFT,
    tokenId: hasNFT ? Math.floor(Math.random() * 1000) : null,
    address: env.WALLET_ADDRESS,
  });
};

async function main() {
  // Initialize LLM client
  const llmClient = new LLMClient({
    provider: 'anthropic',
    apiKey: env.ANTHROPIC_API_KEY,
  });

  // Initialize ChainOfThought with zIdle context
  const dreams = new ChainOfThought(llmClient, {
    worldState: ZIDLE_CONTEXT,
  });

  // Register available actions
  dreams.registerAction(
    'FARM_RESOURCE',
    farmResourceAction,
    {
      description: 'Farm a specific resource for a duration',
      example: JSON.stringify({
        resourceType: 1,
        duration: 60,
      }),
    },
    farmResourceSchema
  );

  dreams.registerAction(
    'GRAPHQL_FETCH',
    graphqlAction,
    {
      description: 'Fetch current game state data',
      example: JSON.stringify({
        query: 'query GetPlayerResources { resources { type amount farmingRate xpLevel xpProgress } }',
      }),
    },
    graphqlFetchSchema
  );

  dreams.registerAction(
    'CONNECT_WALLET',
    connectWalletAction,
    {
      description: 'Connect wallet to start playing',
      example: JSON.stringify({}),
    },
    connectWalletSchema
  );

  dreams.registerAction(
    'CHECK_NFT',
    checkNFTAction,
    {
      description: 'Check if wallet has a character NFT',
      example: JSON.stringify({ address: '0x123...' }),
    },
    walletSchema
  );

  dreams.registerAction(
    'MINT_NFT',
    mintNFTAction,
    {
      description: 'Mint a new character NFT',
      example: JSON.stringify({
        address: '0x123...',
        name: 'Farmer#1',
      }),
    },
    mintNFTSchema
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
