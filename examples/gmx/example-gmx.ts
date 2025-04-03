/**
 * GMX Trading Agent
 *
 * This file implements an AI agent that can interact with the GMX exchange to:
 * - Monitor market conditions
 * - Execute trades
 * - Manage positions
 * - Track performance
 * - Analyze trading history
 */
import 'dotenv/config';
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createDreams, context, render, action, validateEnv, LogLevel, createMemoryStore, createVectorStore, extension, } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { string, z } from "zod";
import { GmxSdk } from "@gmx-io/sdk";
// Validate environment variables
const env = validateEnv(z.object({
    ANTHROPIC_API_KEY: z.string(),
    GMX_NETWORK: z.enum(["arbitrum", "avalanche"]).default("arbitrum"),
    GMX_API_KEY: z.string().optional(),
    GMX_API_SECRET: z.string().optional(),
    GMX_PRIVATE_KEY: z.string().optional(),
    GMX_RPC_URL: z.string(),
    GMX_WALLET_ADDRESS: z.string(),
    GMX_MAX_POSITION_SIZE: z.string().default("1000"),
    GMX_MIN_POSITION_SIZE: z.string().default("10"),
    GMX_MAX_LEVERAGE: z.string().default("10"),
    GMX_SLIPPAGE_TOLERANCE: z.string().default("30"),
    GMX_CHAIN_ID: z.string().optional(),
    GMX_ORACLE_URL: z.string().optional(),
    GMX_SUBGRAPH_URL: z.string().optional(),
    GMX_SUBSQUID_URL: z.string().optional(),
    MONGODB_URI: z.string().optional(),
    MONGODB_DB_NAME: z.string().optional(),
    MONGODB_COLLECTION_NAME: z.string().optional(),
}));
// Initialize SDK with RPC URL and network
const sdk = new GmxSdk({
    rpcUrl: env.GMX_RPC_URL,
    chainId: parseInt(env.GMX_CHAIN_ID || "42161"), // Default to Arbitrum One
    oracleUrl: env.GMX_ORACLE_URL,
    subgraphUrl: env.GMX_SUBGRAPH_URL,
    subsquidUrl: env.GMX_SUBSQUID_URL,
});
// Set the account for the SDK if private key is provided
if (env.GMX_PRIVATE_KEY) {
    try {
        sdk.setAccount(env.GMX_PRIVATE_KEY);
        console.log("GMX SDK initialized with account");
    }
    catch (error) {
        console.error("Error setting account for GMX SDK:", error);
    }
}
// Log startup message
console.log("Starting GMX Trading Agent...");
// Define GMX context template
const GMX_CONTEXT = `
You are an expert AI agent trading on GMX, a decentralized perpetual futures exchange.
Your personality and trading style is detailed in the <character> section.

<goal>
- Monitor market conditions and execute trades based on strategy
- Manage positions and risk
- Keep the User updated on trading activities and performance
- Analyze market trends and identify trading opportunities
- Execute trades with proper position sizing and risk management
- Monitor open positions and adjust strategies as needed
</goal>

<character>
Your name is Trader, and you are a disciplined algorithmic trader.
You focus on risk management and systematic trading approaches.
You are patient and only take trades when conditions are optimal.
You analyze market data thoroughly before making decisions.
You maintain emotional discipline during market volatility.
You communicate clearly about your trading decisions and rationale.
</character>

## Trading Overview
- GMX is a decentralized perpetual futures exchange on ${env.GMX_NETWORK}
- You can trade various assets with leverage
- Each trade requires proper position sizing and risk management
- You must monitor positions and manage risk at all times
- GMX uses a unique price impact model that affects entry and exit prices
- Funding rates affect the cost of holding positions over time

## Risk Management Rules
- Maximum position size: ${env.GMX_MAX_POSITION_SIZE} USD
- Minimum position size: ${env.GMX_MIN_POSITION_SIZE} USD
- Maximum leverage: ${env.GMX_MAX_LEVERAGE}x
- Slippage tolerance: ${env.GMX_SLIPPAGE_TOLERANCE} basis points
- Never risk more than 2% of the portfolio on a single trade
- Use stop losses to limit potential losses
- Take profit levels should be set based on technical analysis

## Trading Strategy
- Monitor market conditions and identify trading opportunities
- Execute trades with proper position sizing and risk management
- Monitor open positions and manage them according to strategy
- Close positions when stop loss or take profit levels are hit
- Analyze past trades to improve future performance

## Market Analysis
- Technical analysis: Support/resistance levels, trend lines, moving averages
- Fundamental analysis: Market news, economic events, project developments
- Sentiment analysis: Social media, community sentiment, market fear/greed
- On-chain analysis: Volume, liquidity, funding rates, open interest

Remember to:
- Always check market conditions before trading
- Monitor your positions and risk exposure
- Keep track of your trading performance
- Stay within the defined risk parameters
- Communicate your analysis and decisions clearly
`;
// Context for the agent
const gmxContexts = context({
    type: "goal",
    schema: z.object({
        id: string(),
        initialGoal: z.string(),
        initialTasks: z.array(z.string()),
        walletAddress: z.string().optional(),
    }),
    key({ id }) {
        return id;
    },
    create(state) {
        return {
            goal: state.args.initialGoal,
            tasks: state.args.initialTasks,
            currentTask: state.args.initialTasks[0],
            walletAddress: state.args.walletAddress || env.GMX_WALLET_ADDRESS,
            positions: [],
            orders: [],
            marketData: null,
            tradingHistory: {
                trades: [],
                performance: {
                    totalPnl: 0,
                    winRate: 0,
                    averageProfit: 0,
                    averageLoss: 0,
                },
            },
            riskParameters: {
                maxPositionSize: parseInt(env.GMX_MAX_POSITION_SIZE),
                minPositionSize: parseInt(env.GMX_MIN_POSITION_SIZE),
                maxLeverage: parseInt(env.GMX_MAX_LEVERAGE),
                slippageTolerance: parseInt(env.GMX_SLIPPAGE_TOLERANCE),
            },
            activeStrategies: [],
        };
    },
    render({ memory }) {
        return render(GMX_CONTEXT, {
            goal: memory.goal,
            tasks: memory.tasks.join("\n"),
            currentTask: memory.currentTask ?? "NONE",
            walletAddress: memory.walletAddress ?? env.GMX_WALLET_ADDRESS,
            positions: memory.positions ?? [],
            orders: memory.orders ?? [],
            marketData: memory.marketData ?? null,
            tradingHistory: memory.tradingHistory,
            riskParameters: memory.riskParameters,
            activeStrategies: memory.activeStrategies,
        });
    },
});
// Create the GMX extension with actions
const gmxExtension = extension({
    name: "gmx",
    contexts: {
        goal: gmxContexts,
    },
    actions: [
        // Market Data Action
        action({
            name: "fetch_market_data",
            description: "Fetch current market data from GMX",
            schema: z.object({
                walletAddress: z.string().describe("The wallet address to fetch data for"),
            }),
            async handler(call, ctx, agent) {
                try {
                    console.log(`Fetching market data for wallet: ${call.data.walletAddress}`);
                    // Set the account for the SDK
                    sdk.setAccount(call.data.walletAddress);
                    // Get markets info and tokens data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    // Get positions
                    const positions = await sdk.positions.getPositions({
                        marketsInfoData,
                        tokensData,
                        start: 0,
                        end: 1000,
                    });
                    // Get orders
                    const { ordersInfoData } = await sdk.orders.getOrders({
                        marketsInfoData,
                        tokensData
                    });
                    // Get daily volumes
                    const volumes = await sdk.markets.getDailyVolumes();
                    // Update state
                    const state = ctx.agentMemory;
                    state.marketData = {
                        markets: marketsInfoData,
                        tokens: tokensData,
                        volumes
                    };
                    state.positions = positions.positionsData ? Object.values(positions.positionsData) : [];
                    state.orders = ordersInfoData ? Object.values(ordersInfoData) : [];
                    return {
                        success: true,
                        message: "Successfully fetched market data",
                        data: {
                            markets: marketsInfoData,
                            tokens: tokensData,
                            positions: state.positions,
                            orders: state.orders,
                            volumes
                        }
                    };
                }
                catch (error) {
                    console.error("Error fetching market data:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to fetch market data"
                    };
                }
            },
        }),
        // Position Management Action
        action({
            name: "manage_positions",
            description: "Check and manage open positions",
            schema: z.object({
                walletAddress: z.string().describe("The wallet address to manage positions for"),
            }),
            async handler(call, ctx, agent) {
                try {
                    console.log(`Managing positions for wallet: ${call.data.walletAddress}`);
                    // Set the account for the SDK
                    sdk.setAccount(call.data.walletAddress);
                    // Get current positions and market data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    const positions = await sdk.positions.getPositions({
                        marketsInfoData,
                        tokensData,
                        start: 0,
                        end: 1000,
                    });
                    // Get position info with additional details
                    const positionsInfo = await sdk.positions.getPositionsInfo({
                        marketsInfoData,
                        tokensData,
                        showPnlInLeverage: true,
                    });
                    // Update state
                    const state = ctx.agentMemory;
                    state.positions = positions.positionsData ? Object.values(positions.positionsData) : [];
                    // Calculate risk metrics
                    const totalPositionValue = state.positions.reduce((total, position) => {
                        return total + Number(position.sizeInUsd || 0) / 1e30;
                    }, 0);
                    return {
                        success: true,
                        message: "Successfully managed positions",
                        positions: state.positions,
                        positionsInfo,
                        metrics: {
                            totalPositionValue: `${totalPositionValue.toFixed(2)} USD`,
                            activePositions: state.positions.length,
                        }
                    };
                }
                catch (error) {
                    console.error("Error managing positions:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to manage positions"
                    };
                }
            },
        }),
        // Order Creation Action
        action({
            name: "create_order",
            description: "Create a new order on GMX",
            schema: z.object({
                walletAddress: z.string(),
                marketAddress: z.string(),
                isLong: z.boolean(),
                sizeUsd: z.number(),
                leverage: z.number(),
                collateralToken: z.string()
            }),
            async handler(call, ctx, agent) {
                try {
                    console.log(`Creating order for wallet: ${call.data.walletAddress}`);
                    // Set the account for the SDK
                    sdk.setAccount(call.data.walletAddress);
                    // Get market data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    // Validate position size
                    if (call.data.sizeUsd > parseInt(env.GMX_MAX_POSITION_SIZE)) {
                        throw new Error(`Position size ${call.data.sizeUsd} exceeds maximum ${env.GMX_MAX_POSITION_SIZE}`);
                    }
                    if (call.data.sizeUsd < parseInt(env.GMX_MIN_POSITION_SIZE)) {
                        throw new Error(`Position size ${call.data.sizeUsd} below minimum ${env.GMX_MIN_POSITION_SIZE}`);
                    }
                    // Validate leverage
                    if (call.data.leverage > parseInt(env.GMX_MAX_LEVERAGE)) {
                        throw new Error(`Leverage ${call.data.leverage} exceeds maximum ${env.GMX_MAX_LEVERAGE}`);
                    }
                    // Get market info and collateral token
                    const marketInfo = marketsInfoData[call.data.marketAddress];
                    if (!marketInfo) {
                        throw new Error(`Market not found: ${call.data.marketAddress}`);
                    }
                    // Find the collateral token data
                    const collateralTokenInfo = tokensData[call.data.collateralToken];
                    if (!collateralTokenInfo) {
                        throw new Error(`Collateral token not found: ${call.data.collateralToken}`);
                    }
                    // Find the index token (the asset being traded)
                    const indexToken = tokensData[marketInfo.indexTokenAddress];
                    if (!indexToken) {
                        throw new Error(`Index token not found for market: ${call.data.marketAddress}`);
                    }
                    // Calculate position amounts
                    const sizeDeltaUsd = BigInt(Math.floor(call.data.sizeUsd * 1e30));
                    const collateralUsd = sizeDeltaUsd / BigInt(call.data.leverage);
                    // Prepare increase amounts
                    const increaseAmounts = {
                        initialCollateralAmount: collateralUsd,
                        initialCollateralUsd: collateralUsd,
                        collateralDeltaAmount: collateralUsd,
                        collateralDeltaUsd: collateralUsd,
                        indexTokenAmount: sizeDeltaUsd,
                        sizeDeltaUsd: sizeDeltaUsd,
                        sizeDeltaInTokens: sizeDeltaUsd,
                        estimatedLeverage: BigInt(call.data.leverage * 10000),
                        indexPrice: marketInfo.maxPrice,
                        initialCollateralPrice: collateralTokenInfo.prices.minPrice,
                        collateralPrice: collateralTokenInfo.prices.minPrice,
                        triggerPrice: BigInt(0),
                        acceptablePrice: marketInfo.maxPrice,
                        acceptablePriceDeltaBps: BigInt(0),
                        positionFeeUsd: BigInt(0),
                        swapPathStats: undefined,
                        uiFeeUsd: BigInt(0),
                        swapUiFeeUsd: BigInt(0),
                        feeDiscountUsd: BigInt(0),
                        borrowingFeeUsd: BigInt(0),
                        fundingFeeUsd: BigInt(0),
                        positionPriceImpactDeltaUsd: BigInt(0),
                    };
                    // Create increase order
                    const txn = await sdk.orders.createIncreaseOrder({
                        marketsInfoData,
                        tokensData,
                        isLimit: false,
                        isLong: call.data.isLong,
                        marketAddress: call.data.marketAddress,
                        allowedSlippage: parseInt(env.GMX_SLIPPAGE_TOLERANCE),
                        collateralToken: collateralTokenInfo,
                        collateralTokenAddress: collateralTokenInfo.address,
                        receiveTokenAddress: collateralTokenInfo.address,
                        fromToken: collateralTokenInfo,
                        marketInfo,
                        indexToken,
                        increaseAmounts,
                        skipSimulation: false,
                    });
                    console.log(`Order created successfully: ${JSON.stringify(txn)}`);
                    return {
                        success: true,
                        message: "Successfully created order",
                        order: {
                            market: call.data.marketAddress,
                            isLong: call.data.isLong,
                            sizeUsd: call.data.sizeUsd,
                            leverage: call.data.leverage,
                            collateralToken: call.data.collateralToken,
                            transaction: txn
                        }
                    };
                }
                catch (error) {
                    console.error("Error creating order:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to create order"
                    };
                }
            },
        }),
    ],
});
// Create the GMX agent
const agent = createDreams({
    logger: LogLevel.INFO,
    model: anthropic("claude-3-7-sonnet-latest"), // anthropic("claude-3-7-sonnet-latest") groq("qwen-2.5-32b")
    extensions: [cli, gmxExtension],
    memory: {
        store: createMemoryStore(),
        vector: createVectorStore(),
        vectorModel: openai("gpt-4o-mini"),
    },
    context: gmxContexts
});
// Start the agent with trading goals
console.log("Starting agent with initial goals...");
agent.start({
    id: "gmx-trading",
    initialGoal: "Trade on GMX following a systematic approach with proper risk management",
    initialTasks: [
        "Monitor market conditions",
        "Check existing positions",
        "Analyze trading performance",
        "Execute trades based on strategy",
        "Manage risk and position sizes"
    ],
});
// Handle exit
globalThis.process?.on("SIGINT", () => {
    console.log("Shutting down agent...");
    globalThis.process?.exit?.(0);
});
