/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌟 VEGA - GMX TRADING AGENT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * A sophisticated AI trading assistant specializing in GMX perpetual futures
 * Built with the Daydreams framework and powered by advanced personality modeling
 * 
 * ✨ Features:
 * • Full GMX protocol integration with real-time trading
 * • Advanced risk management with data-driven decision making
 * • Multi-platform support (CLI + Discord)
 * • Comprehensive market analysis and position tracking
 * • Obsessive risk-conscious personality (10/10 risk management)
 * 
 * 🚀 Quick Start:
 * 1. Configure environment variables (see .env.example)
 * 2. Ensure wallet has sufficient funds for trading
 * 3. Run: `bun run examples/gmx/example-gmx.ts`
 * 
 * 📊 Vega's Personality Profile:
 * • Analytical: 9/10 • Risk-Conscious: 10/10 • Precision: 9/10
 * • Communicative: 9/10 • Proactive: 8/10 • Adaptable: 8/10
 * 
 * ⚠️  IMPORTANT: Ensure token approvals are set via app.gmx.io before trading
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

import { openrouter } from "@openrouter/ai-sdk-provider";
import { openai } from "@ai-sdk/openai";
import { 
    createDreams, 
    context, 
    render, 
    action, 
    validateEnv, 
    LogLevel,
    Logger,
    createMemory,
    createVectorStore,
    createMemoryStore
} from "@daydreamsai/core";
import { cliExtension } from "@daydreamsai/cli";
import { discord } from "@daydreamsai/discord";
import { createMongoMemoryStore } from "@daydreamsai/mongodb";
import { z } from "zod/v4";
import { GmxSdk } from "@gmx-io/sdk";
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

enum OrderType {
    MarketSwap = 0,
    LimitSwap = 1,
    MarketIncrease = 2,
    LimitIncrease = 3,
    MarketDecrease = 4,
    LimitDecrease = 5,
    StopLossDecrease = 6,
    Liquidation = 7,
    StopIncrease = 8
}

// Token ABI for approval operations
const tokenAbi = [
    {
        name: 'approve',
        type: 'function',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'nonpayable'
    }
] as const;

const USD_DECIMALS = 30;

interface GmxTradingState {
    goal: string;
    tasks: string[];
    currentTask: string | null;
    positions: any[];
    orders: any[];
    marketData: {
        markets: any;
        tokens: any;
    } | null;
    tradingHistory: {
        trades: any[];
        performance: {
            totalPnl: number;
            winRate: number;
            averageProfit: number;
            averageLoss: number;
        };
    };
    riskParameters: {
        maxPositionSize: number;
        minPositionSize: number;
        maxLeverage: number;
        slippageTolerance: number;
    };
    activeStrategies: string[];
}

interface GmxTradingMemory {
    lastResult: string | null;
    gmx: GmxTradingState | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const bigIntToDecimal = (value: bigint, decimals: number): number => {
    const valueStr = value.toString();
    const decimalPointPosition = valueStr.length - decimals;

    if (decimalPointPosition <= 0) {
        return Number(`0.${'0'.repeat(Math.abs(decimalPointPosition))}${valueStr}`);
    } else {
        const integerPart = valueStr.substring(0, decimalPointPosition);
        const fractionalPart = valueStr.substring(decimalPointPosition);
        return Number(`${integerPart}.${fractionalPart}`);
    }
};

function getTradeActionDescription(eventName: string, orderType: number, isLong: boolean): string {
    let action = '';
    
    switch (eventName) {
        case 'OrderCreated': action = 'Created'; break;
        case 'OrderExecuted': action = 'Executed'; break;
        case 'OrderCancelled': action = 'Cancelled'; break;
        case 'OrderUpdated': action = 'Updated'; break;
        case 'OrderFrozen': action = 'Frozen'; break;
        default: action = eventName;
    }
    
    let orderTypeStr = '';
    switch (orderType) {
        case 0: orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Increase`; break;
        case 1: orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Increase`; break;
        case 2: orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Decrease`; break;
        case 3: orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Decrease`; break;
        case 4: orderTypeStr = 'Market Swap'; break;
        case 5: orderTypeStr = 'Limit Swap'; break;
        default: orderTypeStr = `Order Type ${orderType}`;
    }
    
    return `${action} ${orderTypeStr}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ ENVIRONMENT VALIDATION & SETUP
// ═══════════════════════════════════════════════════════════════════════════════

console.log("🚀 Starting GMX Trading Agent...", LogLevel.INFO);

const env = validateEnv(
    z.object({
        ANTHROPIC_API_KEY: z.string(),
        OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY is required"),
        GMX_NETWORK: z.enum(["arbitrum", "avalanche"]).default("arbitrum"),
        GMX_CHAIN_ID: z.string(),
        GMX_ORACLE_URL: z.string(),
        GMX_RPC_URL: z.string(),
        GMX_SUBSQUID_URL: z.string(),
        GMX_WALLET_ADDRESS: z.string(),
        GMX_PRIVATE_KEY: z.string(),
        GMX_MAX_POSITION_SIZE: z.string().default("20"),
        GMX_MIN_POSITION_SIZE: z.string().default("5"),
        GMX_MAX_LEVERAGE: z.string().default("1"),
        GMX_SLIPPAGE_TOLERANCE: z.string().default("30"),
        MARKET_ANALYSIS_INTERVAL: z.string().default("300000"),
        POSITION_CHECK_INTERVAL: z.string().default("60000"),
        AUTO_TAKE_PROFIT_PERCENT: z.string().default("20"),
        AUTO_STOP_LOSS_PERCENT: z.string().default("10"),
        MONGODB_STRING: z.string().min(1, "MONGODB_STRING is required for memory persistence"),
        DISCORD_TOKEN: z.string().optional(),
        DISCORD_BOT_NAME: z.string().optional(),
    })
);

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 WALLET & SDK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const account = privateKeyToAccount(env.GMX_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account,
    transport: http(env.GMX_RPC_URL),
    chain: { 
        id: parseInt(env.GMX_CHAIN_ID),
        name: env.GMX_NETWORK === "arbitrum" ? "Arbitrum One" : "Avalanche",
        nativeCurrency: {
            decimals: 18,
            name: env.GMX_NETWORK === "arbitrum" ? "Ethereum" : "Avalanche",
            symbol: env.GMX_NETWORK === "arbitrum" ? "ETH" : "AVAX"
        },
        rpcUrls: {
            default: { http: [env.GMX_RPC_URL] },
            public: { http: [env.GMX_RPC_URL] }
        }
    }
});

const sdk = new GmxSdk({
    rpcUrl: env.GMX_RPC_URL,
    chainId: parseInt(env.GMX_CHAIN_ID || "42161"),
    oracleUrl: env.GMX_ORACLE_URL,
    walletClient: walletClient,
    subsquidUrl: env.GMX_SUBSQUID_URL,
    subgraphUrl: env.GMX_SUBSQUID_URL,
    account: account?.address || env.GMX_WALLET_ADDRESS as `0x${string}`, 
});

if (env.GMX_WALLET_ADDRESS) {
    sdk.setAccount(env.GMX_WALLET_ADDRESS as `0x${string}`);
    console.log(`💼 GMX SDK initialized with account: ${env.GMX_WALLET_ADDRESS}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🗄️ MEMORY & PERSISTENCE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

async function createMongoMemory() {
    console.log("🗄️ Initializing MongoDB memory store...");
    
    try {
        const mongoMemoryStore = await createMongoMemoryStore({
            uri: env.MONGODB_STRING,
            dbName: "vega_gmx_trading",
            collectionName: "trading_memories"
        });
        
        const memory = createMemory(mongoMemoryStore, createVectorStore());
        
        console.log("✅ MongoDB memory store initialized successfully!");
        console.log(`📊 Database: vega_gmx_trading | Collection: trading_memories`);
        
        // Test MongoDB connection with a simple write/read
        const testKey = `connection_test_${Date.now()}`;
        const testValue = { timestamp: new Date().toISOString(), message: "Vega MongoDB connection test" };
        
        await mongoMemoryStore.set(testKey, testValue);
        const retrieved = await mongoMemoryStore.get(testKey);
        
        if (retrieved && retrieved.message === testValue.message) {
            console.log("🧪 MongoDB read/write test: ✅ PASSED");
            await mongoMemoryStore.delete(testKey); // Clean up test data
        } else {
            console.log("🧪 MongoDB read/write test: ❌ FAILED");
        }
        
        return { memory, store: mongoMemoryStore };
    } catch (error) {
        console.error("❌ Failed to initialize MongoDB memory store:", error);
        console.log("⚠️  Falling back to in-memory storage...");
        
        // Fallback to in-memory storage if MongoDB fails
        const fallbackStore = createMemoryStore();
        const memory = createMemory(fallbackStore, createVectorStore());
        
        console.log("✅ Fallback in-memory store initialized");
        
        return { memory, store: null };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 VEGA CHARACTER DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

const vegaCharacter = {
    id: "vega-gmx-trader-v1",
    name: "Vega",
    description: "A sophisticated AI trading assistant specializing in GMX perpetual futures",
    traits: {
        analytical: 9,        // Highly data-driven and methodical
        riskConscious: 10,    // Obsessed with risk management
        opportunistic: 8,     // Quick to spot and act on opportunities  
        communicative: 9,     // Excellent at explaining decisions
        confidence: 7,        // Confident but acknowledges uncertainty
        adaptability: 8,      // Adjusts strategies based on market conditions
        patience: 6,          // Prefers good setups but won't wait forever
        aggression: 5,        // Balanced - neither too conservative nor reckless
        precision: 9,         // Extremely precise with numbers and execution
        proactivity: 8,       // Continuously monitors and suggests improvements
    },
    speechExamples: [
        "I'm seeing a strong setup on ETH-USD with solid risk-reward at current levels",
        "The data suggests we should tighten our stop loss to 2% given the elevated volatility",
        "Risk-reward here looks favorable - targeting 3:1 with proper position sizing",
        "Market conditions have shifted. I recommend adjusting our leverage from 5x to 3x",
        "I've identified an arbitrage opportunity with 1.2% potential profit",
        "Current position is showing 15% unrealized gains. Consider taking partial profits",
        "Funding rates are turning negative - this could impact our long positions",
        "I'm monitoring unusual volume patterns that might signal a trend reversal",
        "Based on my analysis, we should avoid overleveraging in this market environment",
        "The technical indicators are aligning - I suggest scaling into this position gradually"
    ],
    tradingPhilosophy: [
        "Risk management is the foundation of profitable trading",
        "Position sizing determines long-term success more than entry timing",
        "Market conditions change - strategies must evolve with them",
        "Data-driven decisions outperform emotional reactions",
        "Consistent small wins compound into significant returns",
        "Always have an exit plan before entering any position"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 GMX TRADING CONTEXT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const gmxContext = context<GmxTradingMemory>({
    type: "gmx-trading-agent",
    maxSteps: 100,
    schema: z.object({
        name: z.string().describe("The agent's name"),
        role: z.string().describe("The agent's role and specialization"),
    }),
    instructions: `
You are ${vegaCharacter.name}, ${vegaCharacter.description}.

PERSONALITY TRAITS:
${Object.entries(vegaCharacter.traits).map(([trait, level]) => 
    `- ${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${level}/10`
).join('\n')}

TRADING PHILOSOPHY:
${vegaCharacter.tradingPhilosophy.map(p => `- ${p}`).join('\n')}

You are responding in Discord, so keep responses concise and conversational but maintain your analytical and professional demeanor.

TRADING CONFIGURATION & LIMITS:
Your current trading parameters are:
- Maximum Position Size: $${env.GMX_MAX_POSITION_SIZE} USD
- Minimum Position Size: $${env.GMX_MIN_POSITION_SIZE} USD  
- Maximum Leverage: ${env.GMX_MAX_LEVERAGE}x
- Slippage Tolerance: ${env.GMX_SLIPPAGE_TOLERANCE} basis points
- Market Analysis Interval: ${Math.floor(parseInt(env.MARKET_ANALYSIS_INTERVAL) / 1000 / 60)} minutes
- Position Check Interval: ${Math.floor(parseInt(env.POSITION_CHECK_INTERVAL) / 1000)} seconds
- Auto Take Profit: ${env.AUTO_TAKE_PROFIT_PERCENT}%
- Auto Stop Loss: ${env.AUTO_STOP_LOSS_PERCENT}%

ALWAYS respect these limits when discussing or analyzing trading opportunities. Never suggest positions outside these parameters.

COMMUNICATION STYLE:
- Be direct, precise, and analytical
- Use specific numbers and data when possible
- Always consider risk management first
- Speak with confidence but acknowledge uncertainty when appropriate
- Use phrases like: ${vegaCharacter.speechExamples.slice(0, 3).join(', ')}

CORE EXPERTISE:
- GMX perpetual futures trading and analysis
- Risk management and position sizing
- Market analysis (technical, fundamental, sentiment, on-chain)
- Trading strategy development and optimization
- Portfolio management and performance tracking

When discussing trading, always emphasize:
1. Risk management and proper position sizing (within your configured limits)
2. Data-driven decision making
3. Market conditions and their impact on strategy
4. Clear entry/exit criteria
5. Performance metrics and continuous improvement

RISK MANAGEMENT RULES:
- Never suggest positions larger than $${env.GMX_MAX_POSITION_SIZE}
- Never suggest positions smaller than $${env.GMX_MIN_POSITION_SIZE}
- Never suggest leverage higher than ${env.GMX_MAX_LEVERAGE}x
- Always consider ${env.AUTO_TAKE_PROFIT_PERCENT}% take profit and ${env.AUTO_STOP_LOSS_PERCENT}% stop loss levels
- Factor in ${env.GMX_SLIPPAGE_TOLERANCE} bps slippage tolerance

If asked about specific trading actions, provide educational insights about strategy and risk management within your configured parameters.

Remember: You're an expert trading assistant with deep knowledge of GMX and DeFi trading, but always emphasize the importance of DYOR (Do Your Own Research) and proper risk management.

CRITICAL DISCORD RULES:
1. Always respond with natural language text only
2. Never output JSON objects or structured data
3. When action results are received, summarize them conversationally
4. Format responses for Discord readability (use **bold**, *italic*, etc.)
5. Keep responses under 2000 characters for Discord limits
6. Always provide a helpful, conversational response even if an action fails
`,
render: ({ memory, args }: { memory: GmxTradingMemory; args: { name: string; role: string } }) => {
    const tradingState = memory.gmx;

    if (!tradingState) {
      return `
**${vegaCharacter.name} - GMX Trading Assistant** 📈

I'm your GMX trading specialist with expertise in perpetual futures, risk management, and market analysis.

**Personality Profile**
${Object.entries(vegaCharacter.traits).map(([trait, level]) => 
    `${trait.charAt(0).toUpperCase() + trait.slice(1)}: ${level}/10`
).join(' | ')}

Ready to discuss GMX trading strategies, market analysis, or risk management. What's on your mind?

*Note: This is educational content. Always DYOR and manage risk appropriately.*
`;
    }

    const performance = tradingState.tradingHistory.performance;
    const riskParams = tradingState.riskParameters;
    
    return `
**${vegaCharacter.name} - GMX Trading Assistant** 📈

**Current Status**
- Goal: ${tradingState.goal}
- Active Task: ${tradingState.currentTask || "Monitoring markets"}
- Strategies: ${tradingState.activeStrategies.length > 0 ? tradingState.activeStrategies.join(", ") : "Adaptive"}

**Positions & Performance**
- Open Positions: ${tradingState.positions.length}
- Pending Orders: ${tradingState.orders.length}
- Total P&L: ${performance.totalPnl.toFixed(2)} USD
- Win Rate: ${(performance.winRate * 100).toFixed(1)}%

**Risk Parameters**
- Max Position: ${riskParams.maxPositionSize} USD (Min: ${riskParams.minPositionSize} USD)
- Max Leverage: ${riskParams.maxLeverage}x
- Slippage Tolerance: ${riskParams.slippageTolerance} bps
- Auto TP/SL: ${riskParams.autoTakeProfitPercent}%/${riskParams.autoStopLossPercent}%

**Market Data**
- Markets Available: ${tradingState.marketData?.markets ? Object.keys(tradingState.marketData.markets).length : 0}
- Tokens Available: ${tradingState.marketData?.tokens ? Object.keys(tradingState.marketData.tokens).length : 0}

${memory.lastResult ? `**Last Action:** ${memory.lastResult}` : ""}

Ready for market analysis, strategy discussion, or risk management insights!
`;
  },
  create: () => ({
    lastResult: null,
    gmx: {
      goal: "Provide GMX trading insights and analysis",
      tasks: ["Monitor market conditions", "Analyze trading opportunities", "Provide risk management guidance"],
      currentTask: "Monitoring market conditions",
      positions: [],
      orders: [],
      marketData: null,
      tradingHistory: {
        trades: [],
        performance: {
          totalPnl: 0,
          winRate: 0,
          averageProfit: 0,
          averageLoss: 0
        }
      },
      riskParameters: {
        maxPositionSize: parseInt(env.GMX_MAX_POSITION_SIZE || "20"),
        minPositionSize: parseInt(env.GMX_MIN_POSITION_SIZE || "5"),
        maxLeverage: parseInt(env.GMX_MAX_LEVERAGE || "1"),
        slippageTolerance: parseInt(env.GMX_SLIPPAGE_TOLERANCE || "30"),
        marketAnalysisIntervalMs: parseInt(env.MARKET_ANALYSIS_INTERVAL || "300000"),
        positionCheckIntervalMs: parseInt(env.POSITION_CHECK_INTERVAL || "60000"),
        autoTakeProfitPercent: parseInt(env.AUTO_TAKE_PROFIT_PERCENT || "20"),
        autoStopLossPercent: parseInt(env.AUTO_STOP_LOSS_PERCENT || "10")
      },
      activeStrategies: ["Risk Management", "Market Analysis"]
    }
  }),
}).setActions([
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📈 READ METHODS - MARKET DATA
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Markets
    action({
        name: "get_markets_info",
        description: "Get detailed information about markets, tokens, and trading volumes on GMX",
        schema: z.object({}),
        async handler(data, ctx, agent) {                
            try {
                // Fetch market and token information
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                // Fetch daily volumes data
                const volumes = await sdk.markets.getDailyVolumes();
                
                // Create a mapping of market addresses to volume data for easier lookup
                const volumeByMarket: Record<string, {
                    longVolumeUsd: number;
                    shortVolumeUsd: number;
                    totalVolumeUsd: number;
                }> = {};
                
                if (volumes && Array.isArray(volumes)) {
                    volumes.forEach(volumeData => {
                        if (volumeData && volumeData.marketAddress) {
                            // Convert BigInt to human-readable USD values
                            const longVolumeUsd = Number(volumeData.longVolumeUsd ? 
                                volumeData.longVolumeUsd / BigInt(10 ** USD_DECIMALS) : 0n);
                            const shortVolumeUsd = Number(volumeData.shortVolumeUsd ?
                                volumeData.shortVolumeUsd / BigInt(10 ** USD_DECIMALS) : 0n);
                                
                            volumeByMarket[volumeData.marketAddress] = {
                                longVolumeUsd,
                                shortVolumeUsd,
                                totalVolumeUsd: longVolumeUsd + shortVolumeUsd
                            };
                        }
                    });
                }
                
                // Simplify token data to contain only essential information
                const simplifiedTokensData: Record<string, any> = {};
                
                if (tokensData) {
                    Object.keys(tokensData).forEach(address => {
                        const tokenData = tokensData[address];
                        if (tokenData) {
                            simplifiedTokensData[address] = {
                                name: tokenData.name,
                                symbol: tokenData.symbol,
                                decimals: tokenData.decimals,
                                address: tokenData.address,
                                priceDecimals: tokenData.priceDecimals,
                                prices: tokenData.prices ? {
                                    minPrice: tokenData.prices.minPrice,
                                    maxPrice: tokenData.prices.maxPrice
                                } : undefined,
                                balance: tokenData.balance
                            };
                        }
                    });
                }
                
                // Simplify market data to contain only essential information + add volume data
                const simplifiedMarketsData: Record<string, any> = {};
                const marketsWithVolume: any[] = [];
                
                if (marketsInfoData) {
                    Object.keys(marketsInfoData).forEach(address => {
                        const marketData = marketsInfoData[address];
                        console.log(marketData, LogLevel.INFO);
                        if (marketData) {
                            // Get volume data for this market if available
                            const volumeData = volumeByMarket[address] || {
                                longVolumeUsd: 0,
                                shortVolumeUsd: 0,
                                totalVolumeUsd: 0
                            };
                            
                            const simplifiedMarket = {
                                marketTokenAddress: marketData.marketTokenAddress,
                                indexTokenAddress: marketData.indexTokenAddress,
                                longTokenAddress: marketData.longTokenAddress,
                                shortTokenAddress: marketData.shortTokenAddress,
                                name: marketData.name,
                                longInterestUsd: marketData.longInterestUsd 
                                    ? Number(marketData.longInterestUsd / BigInt(10 ** USD_DECIMALS)) 
                                    : 0,
                                shortInterestUsd: marketData.shortInterestUsd 
                                    ? Number(marketData.shortInterestUsd / BigInt(10 ** USD_DECIMALS)) 
                                    : 0,
                                // Include token symbols for easier reference
                                indexToken: marketData.indexToken?.symbol,
                                longToken: marketData.longToken?.symbol,
                                shortToken: marketData.shortToken?.symbol,
                                // Include current prices from the tokens
                                indexTokenPrice: marketData.indexToken?.prices?.maxPrice 
                                    ? Number(marketData.indexToken.prices.maxPrice / BigInt(10 ** USD_DECIMALS))
                                    : 0,
                                longTokenPrice: marketData.longToken?.prices?.maxPrice
                                    ? Number(marketData.longToken.prices.maxPrice / BigInt(10 ** USD_DECIMALS))
                                    : 0,
                                shortTokenPrice: marketData.shortToken?.prices?.maxPrice
                                    ? Number(marketData.shortToken.prices.maxPrice / BigInt(10 ** USD_DECIMALS))
                                    : 0,
                                isSpotOnly: marketData.isSpotOnly,
                                // Include volume data
                                volume: volumeData
                            };
                            
                            simplifiedMarketsData[address] = simplifiedMarket;
                            
                            // Add to array for sorting
                            marketsWithVolume.push({
                                address,
                                ...simplifiedMarket
                            });
                        }
                    });
                }
                
                // Sort markets by volume and get top markets
                const topMarketsByVolume = [...marketsWithVolume]
                    .sort((a, b) => (b.volume?.totalVolumeUsd || 0) - (a.volume?.totalVolumeUsd || 0))
                    .slice(0, 10);
                
                // Sort markets by interest (open positions) and get top markets
                const topMarketsByInterest = [...marketsWithVolume]
                    .sort((a, b) => (b.longInterestUsd + b.shortInterestUsd) - (a.longInterestUsd + a.shortInterestUsd))
                    .slice(0, 10);
                                        
                // Update state with simplified market data
                const memory = ctx.memory as GmxTradingMemory;
                if (memory.gmx) {
                    memory.gmx.marketData = {
                        markets: simplifiedMarketsData,
                        tokens: simplifiedTokensData
                    };
                }
                
                return {
                    success: true,
                    message: `Successfully fetched markets info (${Object.keys(simplifiedMarketsData).length} markets) and tokens data (${Object.keys(simplifiedTokensData).length} tokens)`,
                    marketsSummary: {
                        count: Object.keys(simplifiedMarketsData).length,
                        topMarketsByVolume: topMarketsByVolume.map(m => ({
                            name: m.name,
                            indexToken: m.indexToken,
                            volume: m.volume.totalVolumeUsd
                        })),
                        topMarketsByInterest: topMarketsByInterest.map(m => ({
                            name: m.name,
                            indexToken: m.indexToken,
                            longInterest: m.longInterestUsd,
                            shortInterest: m.shortInterestUsd,
                            totalInterest: m.longInterestUsd + m.shortInterestUsd
                        }))
                    },
                    tokensSummary: {
                        count: Object.keys(simplifiedTokensData).length,
                        sampleTokens: Object.values(simplifiedTokensData)
                            .slice(0, 5)
                            .map(token => ({
                                symbol: token.symbol,
                                name: token.name,
                                address: token.address
                            }))
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch markets info"
                };
            }
        }
    }),

    // Tokens
    action({
        name: "get_tokens_data",
        description: "Get data for available tokens on GMX",
        schema: z.object({}),
        async handler(data, ctx, agent) {
            try {
                const tokensData = await sdk.tokens.getTokensData();
                return {
                    success: true,
                    message: `Successfully fetched data for ${Object.keys(tokensData).length} tokens`,
                    tokensData
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch tokens data"
                };
            }
        }
    })
]);

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 AGENT INITIALIZATION & STARTUP
// ═══════════════════════════════════════════════════════════════════════════════

async function initializeAgent() {
    console.log("⚡ Initializing Vega trading agent with MongoDB persistence...", LogLevel.INFO);
    
    // Initialize MongoDB memory
    const { memory, store } = await createMongoMemory();
    
    // Create the agent with MongoDB memory
    const agent = createDreams({
        model: openrouter("google/gemini-2.0-flash-001"),
        logger: new Logger({ level: LogLevel.INFO }),
        extensions: [discord],
        context: gmxContext,
        memory: memory,
        defaultOutput: "discord:message",
        actions: gmxContext.actions,
    });
    
    console.log("✅ Agent created successfully!");
    
    // Start the agent
    await agent.start({
        name: vegaCharacter.name,
        role: vegaCharacter.description,
    });
    
    console.log("🎯 Vega is now live and ready for GMX trading!");
    
    return { agent, mongoStore: store };
}

console.log("🚀 Starting GMX Trading Agent with Discord...");

let currentAgent: any = null;
let mongoStore: any = null;

// Initialize and start the agent
initializeAgent().then(({ agent, mongoStore: store }) => {
    currentAgent = agent;
    mongoStore = store;
}).catch((error) => {
    console.error("❌ Failed to initialize agent:", error);
    process.exit(1);
});

// Handle graceful shutdown
async function gracefulShutdown() {
    console.log("\n🛑 Shutting down Vega trading agent...");
    
    try {
        if (currentAgent) {
            console.log("📊 Stopping agent...");
            await currentAgent.stop();
        }
        
        // Close MongoDB connection if available
        if (mongoStore && typeof mongoStore.close === 'function') {
            console.log("🗄️ Closing MongoDB connection...");
            await mongoStore.close();
            console.log("✅ MongoDB connection closed");
        }
        
        console.log("✅ Graceful shutdown completed");
    } catch (error) {
        console.error("❌ Error during shutdown:", error);
    } finally {
        process.exit(0);
    }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
