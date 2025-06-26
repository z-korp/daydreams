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
 * ⚠️  IMPORTANT: Ensure token approvals are set via app.gmx.io before trading
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 IMPORTS
// ═══════════════════════════════════════════════════════════════════════════════

import { openrouter } from "@openrouter/ai-sdk-provider";
import { 
    createDreams, 
    context, 
    render, 
    action, 
    input,
    validateEnv, 
    LogLevel,
    Logger
} from "@daydreamsai/core";
import { discord } from "@daydreamsai/discord";
import { z } from "zod/v4";
import { GmxSdk } from "@gmx-io/sdk";
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 CONSTANTS & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

const USD_DECIMALS = 30;

// Flat memory structure following task example pattern
interface GmxMemory {
    // Core trading data
    positions: any[];
    orders: any[];
    markets: Record<string, any>;
    tokens: Record<string, any>;
    volumes: Record<string, {
        market: string;
        volume: string;
    }>;
    
    // Trading performance
    trades: any[];
    totalPnl: number;
    winRate: number;
    averageProfit: number;
    averageLoss: number;
    
    // Current state
    currentTask: string | null;
    lastResult: string | null;
    
    // Risk configuration
    maxPositionSize: number;
    minPositionSize: number;
    maxLeverage: number;
    slippageTolerance: number;
    
    // Trading strategy
    activeStrategies: string[];
    
    // Synth intelligence data
    synthLeaderboard: {
        miners: any[];
        lastUpdated: string | null;
        topMinerIds: number[];
    };
    synthPredictions: Record<string, Record<number, {
        predictions: any[];
        lastUpdated: string;
        asset: string;
        minerId: number;
    }>>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Use GMX SDK's decimal conversion utilities for maximum precision
const bigIntToDecimal = (value: bigint, decimals: number): number => {
    // Handle negative values properly
    const negative = value < 0n;
    const absValue = negative ? -value : value;
    
    const divisor = 10n ** BigInt(decimals);
    const integerPart = absValue / divisor;
    const fractionalPart = absValue % divisor;
    
    // Convert to string to avoid precision loss, then parse as float
    const result = parseFloat(`${integerPart}.${fractionalPart.toString().padStart(decimals, "0")}`);
    return negative ? -result : result;
};

// More precise decimal formatting following GMX SDK patterns
const formatTokenAmount = (value: bigint, decimals: number, displayDecimals: number = 6): string => {
    const num = bigIntToDecimal(value, decimals);
    return num.toFixed(displayDecimals);
};

// Proper USD formatting with commas
const formatUsdAmount = (value: bigint, displayDecimals: number = 2): string => {
    const num = bigIntToDecimal(value, USD_DECIMALS);
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: displayDecimals,
        maximumFractionDigits: displayDecimals
    }).format(num);
};


// ═══════════════════════════════════════════════════════════════════════════════
// 🧮 GMX CALCULATION UTILITIES (Following Official SDK Patterns)
// ═══════════════════════════════════════════════════════════════════════════════

const BASIS_POINTS_DIVISOR = 10000n;
const PRECISION = 10n ** 30n;

// Apply factor (similar to GMX SDK's applyFactor)
const applyFactor = (value: bigint, factor: bigint): bigint => {
    return (value * factor) / PRECISION;
};

// Convert token amount to USD (following GMX SDK pattern)
const convertToUsd = (
    tokenAmount: bigint | undefined,
    tokenDecimals: number | undefined,
    price: bigint | undefined
): bigint | undefined => {
    if (tokenAmount === undefined || typeof tokenDecimals !== "number" || price === undefined) {
        return undefined;
    }
    return (tokenAmount * price) / (10n ** BigInt(tokenDecimals));
};

// Convert USD amount to token amount (following GMX SDK pattern)
const convertToTokenAmount = (
    usd: bigint | undefined,
    tokenDecimals: number | undefined,
    price: bigint | undefined
): bigint | undefined => {
    if (usd === undefined || typeof tokenDecimals !== "number" || price === undefined || price <= 0n) {
        return undefined;
    }
    return (usd * (10n ** BigInt(tokenDecimals))) / price;
};

// Calculate position PnL following GMX SDK logic
const calculatePositionPnl = (params: {
    sizeInUsd: bigint;
    sizeInTokens: bigint;
    markPrice: bigint;
    isLong: boolean;
    indexTokenDecimals: number;
}): bigint => {
    const { sizeInUsd, sizeInTokens, markPrice, isLong, indexTokenDecimals } = params;
    
    // Calculate current position value in USD
    const positionValueUsd = convertToUsd(sizeInTokens, indexTokenDecimals, markPrice);
    if (!positionValueUsd) return 0n;
    
    // Calculate PnL: Long = currentValue - originalSize, Short = originalSize - currentValue
    const pnl = isLong ? positionValueUsd - sizeInUsd : sizeInUsd - positionValueUsd;
    
    return pnl;
};

// Calculate leverage following GMX SDK logic
const calculateLeverage = (params: {
    sizeInUsd: bigint;
    collateralUsd: bigint;
    pnl: bigint;
    pendingFundingFeesUsd: bigint;
    pendingBorrowingFeesUsd: bigint;
}): bigint | undefined => {
    const { sizeInUsd, collateralUsd, pnl, pendingFundingFeesUsd, pendingBorrowingFeesUsd } = params;
    
    const totalPendingFeesUsd = pendingFundingFeesUsd + pendingBorrowingFeesUsd;
    const remainingCollateralUsd = collateralUsd + pnl - totalPendingFeesUsd;
    
    if (remainingCollateralUsd <= 0n) return undefined;
    
    return (sizeInUsd * BASIS_POINTS_DIVISOR) / remainingCollateralUsd;
};

// Calculate liquidation price following GMX SDK logic
const calculateLiquidationPrice = (params: {
    sizeInUsd: bigint;
    sizeInTokens: bigint;
    collateralAmount: bigint;
    collateralUsd: bigint;
    markPrice: bigint;
    indexTokenDecimals: number;
    collateralTokenDecimals: number;
    isLong: boolean;
    minCollateralFactor: bigint;
    pendingBorrowingFeesUsd: bigint;
    pendingFundingFeesUsd: bigint;
    isSameCollateralAsIndex: boolean;
}): bigint | undefined => {
    const { 
        sizeInUsd, sizeInTokens, collateralAmount, collateralUsd, markPrice,
        indexTokenDecimals, isLong, minCollateralFactor, 
        pendingBorrowingFeesUsd, pendingFundingFeesUsd, isSameCollateralAsIndex
    } = params;
    
    const liquidationCollateralUsd = applyFactor(sizeInUsd, minCollateralFactor);
    const totalFeesUsd = pendingBorrowingFeesUsd + pendingFundingFeesUsd;
    
    try {
        if (isSameCollateralAsIndex) {
            // Same collateral as index token
            if (isLong) {
                const numerator = sizeInUsd + liquidationCollateralUsd + totalFeesUsd;
                const denominator = sizeInTokens + collateralAmount;
                if (denominator <= 0n) return undefined;
                return (numerator * (10n ** BigInt(indexTokenDecimals))) / denominator;
            } else {
                const numerator = sizeInUsd - liquidationCollateralUsd - totalFeesUsd;
                const denominator = sizeInTokens - collateralAmount;
                if (denominator <= 0n) return undefined;
                return (numerator * (10n ** BigInt(indexTokenDecimals))) / denominator;
            }
        } else {
            // Different collateral from index token
            const remainingCollateralUsd = collateralUsd - totalFeesUsd;
            
            if (isLong) {
                const numerator = liquidationCollateralUsd - remainingCollateralUsd + sizeInUsd;
                if (sizeInTokens <= 0n) return undefined;
                return (numerator * (10n ** BigInt(indexTokenDecimals))) / sizeInTokens;
            } else {
                const numerator = liquidationCollateralUsd - remainingCollateralUsd - sizeInUsd;
                if (sizeInTokens <= 0n) return undefined;
                return (numerator * (10n ** BigInt(indexTokenDecimals))) / (-sizeInTokens);
            }
        }
    } catch (error) {
        console.warn("Error calculating liquidation price:", error);
        return undefined;
    }
};

// Calculate position net value
const calculatePositionNetValue = (params: {
    collateralUsd: bigint;
    pnl: bigint;
    pendingFundingFeesUsd: bigint;
    pendingBorrowingFeesUsd: bigint;
    closingFeeUsd?: bigint;
}): bigint => {
    const { collateralUsd, pnl, pendingFundingFeesUsd, pendingBorrowingFeesUsd, closingFeeUsd = 0n } = params;
    
    const pendingFeesUsd = pendingFundingFeesUsd + pendingBorrowingFeesUsd;
    return collateralUsd - pendingFeesUsd - closingFeeUsd + pnl;
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
        case 0: orderTypeStr = 'Market Swap'; break;
        case 1: orderTypeStr = 'Limit Swap'; break;
        case 2: orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Increase`; break;
        case 3: orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Increase`; break;
        case 4: orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Decrease`; break;
        case 5: orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Decrease`; break;
        case 6: orderTypeStr = `Stop Loss ${isLong ? 'Long' : 'Short'} Decrease`; break;
        case 7: orderTypeStr = 'Liquidation'; break;
        case 8: orderTypeStr = `Stop ${isLong ? 'Long' : 'Short'} Increase`; break;
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
        GMX_MAX_POSITION_SIZE: z.string().default("10"),
        GMX_MIN_POSITION_SIZE: z.string().default("5"),
        GMX_MAX_LEVERAGE: z.string().default("3"),
        GMX_SLIPPAGE_TOLERANCE: z.string().default("125"),
        MARKET_ANALYSIS_INTERVAL: z.string().default("300000"),
        POSITION_CHECK_INTERVAL: z.string().default("60000"),
        AUTO_TAKE_PROFIT_PERCENT: z.string().default("20"),
        AUTO_STOP_LOSS_PERCENT: z.string().default("10"),
        SYNTH_API_KEY: z.string().min(1, "SYNTH_API_KEY is required for market intelligence"),
        DISCORD_TOKEN: z.string().optional(),
        DISCORD_BOT_NAME: z.string().optional(),
    })
);

// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 WALLET & SDK CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

// Validate hex address format
const validateHexAddress = (address: string): address is `0x${string}` => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const validatePrivateKey = (key: string): key is `0x${string}` => {
    return /^0x[a-fA-F0-9]{64}$/.test(key);
};

// Validate private key format
if (!validatePrivateKey(env.GMX_PRIVATE_KEY)) {
    throw new Error("Invalid private key format. Must be 64 hex characters with 0x prefix.");
}

// Validate wallet address format
if (!validateHexAddress(env.GMX_WALLET_ADDRESS)) {
    throw new Error("Invalid wallet address format. Must be 40 hex characters with 0x prefix.");
}

const account = privateKeyToAccount(env.GMX_PRIVATE_KEY as `0x${string}`);

// Define supported chain configurations
const SUPPORTED_CHAINS = {
    42161: { 
        name: "Arbitrum One", 
        symbol: "ETH", 
        decimals: 18,
        network: "arbitrum"
    },
    43114: { 
        name: "Avalanche", 
        symbol: "AVAX", 
        decimals: 18,
        network: "avalanche"
    },
    // Add more chains as needed
} as const;

const chainId = parseInt(env.GMX_CHAIN_ID);
const chainConfig = SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS];

if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${chainId}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`);
}

// Validate that network matches chain ID
if (chainConfig.network !== env.GMX_NETWORK) {
    throw new Error(`Network mismatch: Chain ID ${chainId} corresponds to ${chainConfig.network}, but GMX_NETWORK is set to ${env.GMX_NETWORK}`);
}

const walletClient = createWalletClient({
    account,
    transport: http(env.GMX_RPC_URL),
    chain: { 
        id: chainId,
        name: chainConfig.name,
        nativeCurrency: {
            decimals: chainConfig.decimals,
            name: chainConfig.name,
            symbol: chainConfig.symbol
        },
        rpcUrls: {
            default: { http: [env.GMX_RPC_URL] },
            public: { http: [env.GMX_RPC_URL] }
        }
    }
});

const sdk = new GmxSdk({
    rpcUrl: env.GMX_RPC_URL,
    chainId: chainId,
    oracleUrl: env.GMX_ORACLE_URL,
    walletClient: walletClient,
    subsquidUrl: env.GMX_SUBSQUID_URL,
    subgraphUrl: env.GMX_SUBSQUID_URL,
    account: account?.address || env.GMX_WALLET_ADDRESS as `0x${string}`
});

if (env.GMX_WALLET_ADDRESS) {
    sdk.setAccount(env.GMX_WALLET_ADDRESS as `0x${string}`);
    console.log(`💼 GMX SDK initialized with account: ${env.GMX_WALLET_ADDRESS}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 VEGA CHARACTER DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

const vegaCharacter = {
    id: "vega-gmx-portfolio-manager-v2",
    name: "Vega",
    description: "An elite autonomous GMX trader",
    speechExamples: [
        "🎯 Opening 3x long ETH at $3,100 - momentum breakout + oversold RSI confluence",
        "✅ ETH position +12% - raising stop to breakeven, taking partial profit at $3,400",
        "📊 Market analysis: BTC showing weakness, reducing long exposure to 15% portfolio",
        "⚠️ High volatility detected - scaling down position sizes by 30% across all markets",
        "💰 Portfolio performance: +8.2% this week, 4 wins, 1 loss, 78% win rate",
        "🔄 Rebalancing: Closing LINK position (+15%) to reallocate into ETH momentum",
        "📈 Strong volume surge on SOL - increasing allocation to 20% with tight stops",
        "🛡️ Risk update: All positions now 2.5% from liquidation - well within safety margins",
        "🎪 Market regime shift detected - moving from trend following to mean reversion",
        "⚡ Execution: Filled ETH entry at $3,098 (2 bps slippage) - adding to winners"
    ],
    tradingPhilosophy: [
        "Position sizing and leverage control determine long-term survival and success",
        "Markets evolve constantly - strategies must adapt dynamically to changing conditions",
        "Data-driven decisions with comprehensive analytics outperform emotional reactions",
        "Consistent execution of edge-based strategies compounds into significant alpha",
        "Every position requires predetermined exit criteria - both profit and loss scenarios",
        "Portfolio-level thinking trumps individual trade optimization",
        "Liquidity and execution quality are as important as market direction",
        "Continuous monitoring and active management separate professionals from amateurs",
        "Transparency in decision-making builds trust and improves performance tracking"
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 GMX TRADING CONTEXT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const gmxContext = context<GmxMemory>({
    type: "gmx-trading-agent",
    maxSteps: 100,
    schema: z.object({
        name: z.string().describe("The agent's name"),
        role: z.string().describe("The agent's role and specialization"),
    }),
    instructions: `
You are ${vegaCharacter.name}, ${vegaCharacter.description}.

## TRADING PHILOSOPHY:
${vegaCharacter.tradingPhilosophy.map(p => `- ${p}`).join('\n')}

## SPEECH EXAMPLES:
${vegaCharacter.speechExamples.map(p => `- ${p}`).join('\n')}

`,
render: (state) => {
    const memory = state.memory;
    
    return `
        **${vegaCharacter.name} - GMX Portfolio Manager** 📈

        **Current Status**
        - Active Task: ${memory.currentTask || "Monitoring markets"}
        - Strategies: ${memory.activeStrategies.length > 0 ? memory.activeStrategies.join(", ") : "Adaptive"}

        **Positions & Performance**
        - Open Positions: ${memory.positions.length}
        - Pending Orders: ${memory.orders.length}
        - Total P&L: $${memory.totalPnl.toFixed(2)}
        - Win Rate: ${memory.winRate.toFixed(1)}%
        - Average Win: $${memory.averageProfit.toFixed(2)}
        - Average Loss: $${memory.averageLoss.toFixed(2)}

        **Risk Parameters**
        - Max Position: ${memory.maxPositionSize}% of portfolio
        - Max Leverage: ${memory.maxLeverage}x
        - Default Slippage: ${memory.slippageTolerance} bps (${(memory.slippageTolerance/100).toFixed(2)}%)
        - Portfolio-based Sizing: Enabled

        **Market Intelligence**
        - Markets Tracked: ${Object.keys(memory.markets).length}
        - Active Tokens: ${Object.keys(memory.tokens).length}
        - Volume Data: ${Object.keys(memory.volumes).length} markets
        - Total Volume: $${Object.values(memory.volumes).reduce((total, vol) => total + parseFloat(vol.volume), 0).toFixed(2)}
        - Analysis Depth: Comprehensive (PnL, Liquidations, Risk Metrics)

        **Synth Intelligence**
        - Top Miners: ${memory.synthLeaderboard.topMinerIds.length}
        - Leaderboard Updated: ${memory.synthLeaderboard.lastUpdated ? new Date(memory.synthLeaderboard.lastUpdated).toLocaleString() : "Never"}
        - Active Predictions: ${Object.keys(memory.synthPredictions).reduce((total, asset) => total + Object.keys(memory.synthPredictions[asset]).length, 0)} miners

        ${memory.lastResult ? `**Last Action:** ${memory.lastResult}` : ""}

        Continuously scanning for opportunities and managing risk...
    `;
  },
  create: () => {
        console.log("🎯 Creating memory for GMX trading agent");
        
        return {
            // Core trading data
            positions: [],
            orders: [],
            markets: {},
            tokens: {},
            volumes: {},
            
            // Trading performance
            trades: [],
            totalPnl: 0,
            winRate: 0,
            averageProfit: 0,
            averageLoss: 0,
            
            // Current state
            currentTask: "Initializing GMX trading agent",
            lastResult: null,
            
            // Risk configuration
            maxPositionSize: parseFloat(env.GMX_MAX_POSITION_SIZE || "10"),
            minPositionSize: parseFloat(env.GMX_MIN_POSITION_SIZE || "5"),
            maxLeverage: parseInt(env.GMX_MAX_LEVERAGE || "3"),
            slippageTolerance: parseInt(env.GMX_SLIPPAGE_TOLERANCE || "125"),
            
            // Trading strategy
            activeStrategies: ["Risk Management", "Market Analysis"],
            
            // Synth intelligence data
            synthLeaderboard: {
                miners: [],
                lastUpdated: null,
                topMinerIds: []
            },
            synthPredictions: {}
        };
    },
});

const gmxActions = [
    // ═══════════════════════════════════════════════════════════════════════════════
    // 📈 READ METHODS - MARKET DATA
    // ═══════════════════════════════════════════════════════════════════════════════
    
    // Markets Info (Official SDK Method)
    action({
        name: "get_markets_info",
        description: "Get detailed information about markets and tokens using official SDK method (volume data excluded - use get_daily_volumes for volume information)",
        async handler(data, ctx, agent) {                
            try {
                // Use official SDK method with enhanced error handling following SDK patterns
                const marketDataResult = await sdk.markets.getMarketsInfo().catch(error => {
                    console.error("Failed to fetch markets info:", error);
                    
                    // Parse error following GMX SDK patterns
                    let errorMessage = "Unknown error occurred";
                    
                    if (error?.message) {
                        errorMessage = error.message;
                    } else if (typeof error === 'string') {
                        errorMessage = error;
                    } else if (error?.code === 'NETWORK_ERROR') {
                        errorMessage = "Network connection failed. Please check your internet connection.";
                    } else if (error?.code === 'TIMEOUT') {
                        errorMessage = "Request timed out. Please try again.";
                    }
                    
                    throw new Error(`GMX SDK getMarketsInfo failed: ${errorMessage}`);
                });
                
                const { marketsInfoData, tokensData } = marketDataResult;
                
                // Validate response data
                if (!marketsInfoData || typeof marketsInfoData !== 'object') {
                    throw new Error("Invalid markets info data received from GMX SDK");
                }
                
                if (!tokensData || typeof tokensData !== 'object') {
                    throw new Error("Invalid tokens data received from GMX SDK");
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
                
                // Simplify market data to contain only essential information
                const simplifiedMarketsData: Record<string, any> = {};
                
                if (marketsInfoData) {
                    Object.keys(marketsInfoData).forEach(address => {
                        const marketData = marketsInfoData[address];

                        if (marketData) {
                            
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
                                isSpotOnly: marketData.isSpotOnly
                            };
                            
                            simplifiedMarketsData[address] = simplifiedMarket;
                        }
                    });
                }
                
                // Sort markets by interest (open positions) and get top markets
                const topMarketsByInterest = Object.values(simplifiedMarketsData)
                    .sort((a: any, b: any) => (b.longInterestUsd + b.shortInterestUsd) - (a.longInterestUsd + a.shortInterestUsd))
                    .slice(0, 10);
                                        
                // Update state with simplified market data - flat memory structure
                const memory = ctx.memory as GmxMemory;
                try {
                    // Direct assignment to flat memory structure
                    memory.markets = { ...simplifiedMarketsData };
                    memory.tokens = { ...simplifiedTokensData };
                    memory.currentTask = "Processing market data";
                    memory.lastResult = `Fetched ${Object.keys(simplifiedMarketsData).length} markets and ${Object.keys(simplifiedTokensData).length} tokens`;
                } catch (error) {
                    console.error("Failed to update memory state:", error);
                    // Continue without updating memory rather than failing
                }
                
                return {
                    success: true,
                    message: `Successfully fetched markets info (${Object.keys(simplifiedMarketsData).length} markets) and tokens data (${Object.keys(simplifiedTokensData).length} tokens)`,
                    marketsSummary: {
                        count: Object.keys(simplifiedMarketsData).length,
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

    // Markets List (Official SDK Method)
    action({
        name: "get_markets_list",
        description: "Get list of markets using official SDK method",
        schema: z.object({
            offset: z.number().optional().describe("Offset for pagination"),
            limit: z.number().optional().describe("Limit for pagination")
        }),
        async handler(data, ctx, agent) {
            try {
                // Use official SDK method
                const markets = await sdk.markets.getMarkets(data.offset, data.limit);
                
                const memory = ctx.memory as GmxMemory;
                
                // Update memory with market data
                if (markets.marketsData) {
                    memory.markets = { ...memory.markets, ...markets.marketsData };
                }
                memory.currentTask = "getMarkets";
                memory.lastResult = `Retrieved ${markets.marketsAddresses?.length || 0} markets`;

                return {
                    success: true,
                    message: `Retrieved ${markets.marketsAddresses?.length || 0} markets`,
                    markets: markets,
                    pagination: {
                        offset: data.offset || 0,
                        limit: data.limit || 100
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch markets list"
                };
            }
        }
    }),

    // Daily Volumes (Official SDK Method)
    action({
        name: "get_daily_volumes",
        description: "Get daily volume data for markets using official SDK method",
        async handler(data, ctx, agent) {
            try {
                // Use official SDK method - returns Record<string, bigint> | undefined
                const volumes = await sdk.markets.getDailyVolumes();
                
                // Check if volumes data exists (should be a Record, not array)
                if (!volumes || typeof volumes !== 'object') {
                    return {
                        success: false,
                        message: "No volume data available or invalid data format",
                        volumes: [],
                        rawData: volumes // For debugging
                    };
                }

                // Convert Record<string, bigint> to array format
                const formattedVolumes = Object.entries(volumes).map(([market, volumeBigInt]) => {
                    try {
                        return {
                            market: market,
                            volume: Number(volumeBigInt / BigInt(10 ** USD_DECIMALS)).toFixed(2)
                        };
                    } catch (err) {
                        console.error("Error processing volume entry:", err, { market, volumeBigInt });
                        return {
                            market: market || 'Error',
                            volume: '0.00'
                        };
                    }
                });

                const totalVolume = formattedVolumes.reduce((sum, vol) => sum + parseFloat(vol.volume), 0);

                // Store volumes in memory
                const memory = ctx.memory as GmxMemory;
                memory.volumes = formattedVolumes.reduce((acc, vol) => {
                    acc[vol.market] = vol;
                    return acc;
                }, {} as Record<string, { market: string; volume: string }>);
                memory.currentTask = "getDailyVolumes";
                memory.lastResult = `Retrieved daily volumes for ${formattedVolumes.length} markets (total: $${totalVolume.toFixed(2)})`;

                return {
                    success: true,
                    message: `Retrieved daily volumes for ${formattedVolumes.length} markets`,
                    volumes: formattedVolumes,
                    totalVolume: totalVolume.toFixed(2),
                    rawDataType: typeof volumes,
                    marketCount: formattedVolumes.length
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch daily volumes"
                };
            }
        }
    }),

    // Tokens
    action({
        name: "get_tokens_data",
        description: "Get data for available tokens on GMX",
        async handler(data, ctx, agent) {
            try {
                const tokensData = await sdk.tokens.getTokensData().catch(error => {
                    console.error("Failed to fetch tokens data:", error);
                    throw new Error(`GMX SDK getTokensData failed: ${error.message || error}`);
                });
                
                if (!tokensData || typeof tokensData !== 'object') {
                    throw new Error("Invalid tokens data received from GMX SDK");
                }
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
    }),

    // ═══════════════════════════════════════════════════════════════════════════════
    // 💹 POSITIONS & TRADES
    // ═══════════════════════════════════════════════════════════════════════════════

    // Enhanced Positions with Complete Calculations
    action({
        name: "get_positions",
        description: "Get all current trading positions with comprehensive PnL, liquidation price, and risk metrics calculations",
        async handler(data, ctx, agent) {
            try {
                // Get required market and token data first
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo().catch(error => {
                    throw new Error(`Failed to get market data: ${error.message || error}`);
                });
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Use official SDK method with required parameters
                const positionsResult = await sdk.positions.getPositions({
                    marketsData: marketsInfoData,
                    tokensData: tokensData,
                    start: 0,
                    end: 1000,
                }).catch(error => {
                    throw new Error(`Failed to get positions: ${error.message || error}`);
                });
                
                const memory = ctx.memory as GmxMemory;
                
                // Extract and enhance positions data with complete calculations
                const rawPositions = positionsResult.positionsData ? Object.values(positionsResult.positionsData) : [];
                
                const enhancedPositions = rawPositions.map(position => {
                    try {
                        // Get market and token information
                        const marketInfo = marketsInfoData[position.marketAddress];
                        if (!marketInfo) {
                            console.warn(`Market not found for position: ${position.marketAddress}`);
                            return null;
                        }
                        
                        const indexToken = tokensData[marketInfo.indexTokenAddress];
                        const collateralToken = tokensData[position.collateralTokenAddress];
                        
                        if (!indexToken || !collateralToken) {
                            console.warn(`Tokens not found for position: ${position.key}`);
                            return null;
                        }
                        
                        // Get token decimals
                        const indexTokenDecimals = indexToken.decimals || 18;
                        const collateralTokenDecimals = collateralToken.decimals || 6;
                        
                        // Determine mark price (use max for longs when increasing, min for shorts)
                        const markPrice = position.isLong ? 
                            indexToken.prices?.maxPrice || 0n : 
                            indexToken.prices?.minPrice || 0n;
                        
                        const collateralPrice = position.isLong ?
                            collateralToken.prices?.minPrice || 0n :
                            collateralToken.prices?.maxPrice || 0n;
                        
                        // Calculate enhanced metrics using our utility functions
                        const calculatedPnl = calculatePositionPnl({
                            sizeInUsd: position.sizeInUsd,
                            sizeInTokens: position.sizeInTokens,
                            markPrice,
                            isLong: position.isLong,
                            indexTokenDecimals
                        });
                        
                        const collateralUsd = convertToUsd(
                            position.collateralAmount, 
                            collateralTokenDecimals, 
                            collateralPrice
                        );
                        
                        const leverage = calculateLeverage({
                            sizeInUsd: position.sizeInUsd,
                            collateralUsd,
                            pnl: calculatedPnl,
                            pendingFundingFeesUsd: position.pendingFundingFeesUsd || 0n,
                            pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd || 0n
                        });
                        
                        // Check if collateral token is same as index token
                        const isSameCollateralAsIndex = position.collateralTokenAddress.toLowerCase() === 
                            marketInfo.indexTokenAddress.toLowerCase();
                        
                        const liquidationPrice = calculateLiquidationPrice({
                            sizeInUsd: position.sizeInUsd,
                            sizeInTokens: position.sizeInTokens,
                            collateralAmount: position.collateralAmount,
                            collateralUsd,
                            markPrice,
                            indexTokenDecimals,
                            collateralTokenDecimals,
                            isLong: position.isLong,
                            minCollateralFactor: marketInfo.minCollateralFactor || (5n * 10n ** 27n), // 0.5% default
                            pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd || 0n,
                            pendingFundingFeesUsd: position.pendingFundingFeesUsd || 0n,
                            isSameCollateralAsIndex
                        });
                        
                        const netValue = calculatePositionNetValue({
                            collateralUsd,
                            pnl: calculatedPnl,
                            pendingFundingFeesUsd: position.pendingFundingFeesUsd || 0n,
                            pendingBorrowingFeesUsd: position.pendingBorrowingFeesUsd || 0n
                        });
                        
                        // Calculate percentage metrics
                        const pnlPercentage = collateralUsd > 0n ? 
                            Number((calculatedPnl * 10000n) / collateralUsd) / 100 : 0;
                        
                        const leverageNumber = leverage ? Number(leverage) / 10000 : 0;
                        
                        // Calculate distance to liquidation
                        const currentPrice = bigIntToDecimal(markPrice, USD_DECIMALS);
                        const liqPrice = liquidationPrice ? bigIntToDecimal(liquidationPrice, USD_DECIMALS) : 0;
                        const distanceToLiquidation = currentPrice > 0 && liqPrice > 0 ? 
                            Math.abs((currentPrice - liqPrice) / currentPrice) * 100 : 0;
                        
                        return {
                            // Basic position info
                            key: position.key,
                            marketAddress: position.marketAddress,
                            marketName: marketInfo.name,
                            indexToken: indexToken.symbol,
                            collateralToken: collateralToken.symbol,
                            direction: position.isLong ? 'LONG' : 'SHORT',
                            
                            // Size and collateral
                            sizeUsd: formatUsdAmount(position.sizeInUsd, 2),
                            sizeInTokens: formatTokenAmount(position.sizeInTokens, indexTokenDecimals, 6),
                            collateralUsd: formatUsdAmount(collateralUsd, 2),
                            collateralAmount: formatTokenAmount(position.collateralAmount, collateralTokenDecimals, 6),
                            
                            // Calculated metrics
                            pnl: formatUsdAmount(calculatedPnl, 2),
                            pnlPercentage: `${pnlPercentage.toFixed(2)}%`,
                            netValue: formatUsdAmount(netValue, 2),
                            leverage: `${leverageNumber.toFixed(2)}x`,
                            
                            // Prices
                            markPrice: formatUsdAmount(markPrice, 2),
                            entryPrice: position.sizeInTokens > 0n ? 
                                formatUsdAmount((position.sizeInUsd * (10n ** BigInt(indexTokenDecimals))) / position.sizeInTokens, 2) : 
                                "$0.00",
                            liquidationPrice: liquidationPrice ? formatUsdAmount(liquidationPrice, 2) : "N/A",
                            
                            // Risk metrics
                            distanceToLiquidation: `${distanceToLiquidation.toFixed(2)}%`,
                            
                            // Fees
                            pendingBorrowingFees: formatUsdAmount(position.pendingBorrowingFeesUsd || 0n, 4),
                            pendingFundingFees: formatUsdAmount(position.pendingFundingFeesUsd || 0n, 4),
                            
                            // Timestamps
                            createdAt: position.increasedAtTime ? 
                                new Date(Number(position.increasedAtTime) * 1000).toISOString() : null,
                            
                            // Raw data for advanced usage
                            raw: {
                                sizeInUsd: position.sizeInUsd.toString(),
                                sizeInTokens: position.sizeInTokens.toString(),
                                collateralAmount: position.collateralAmount.toString(),
                                calculatedPnl: calculatedPnl.toString(),
                                markPrice: markPrice.toString(),
                                liquidationPrice: liquidationPrice?.toString() || null
                            }
                        };
                    } catch (error) {
                        console.error(`Error processing position ${position.key}:`, error);
                        return null;
                    }
                }).filter(Boolean);
                
                // Update memory with flat structure
                memory.positions = enhancedPositions;
                memory.currentTask = "Analyzed positions";
                memory.lastResult = `Retrieved ${enhancedPositions.length} positions with complete analysis`;

                // Calculate portfolio summary
                const totalSizeUsd = enhancedPositions.reduce((sum, pos) => {
                    const sizeNum = parseFloat(pos.sizeUsd.replace(/[$,]/g, ''));
                    return sum + sizeNum;
                }, 0);
                
                const totalPnl = enhancedPositions.reduce((sum, pos) => {
                    const pnlNum = parseFloat(pos.pnl.replace(/[$,]/g, ''));
                    return sum + pnlNum;
                }, 0);
                
                const totalCollateral = enhancedPositions.reduce((sum, pos) => {
                    const collateralNum = parseFloat(pos.collateralUsd.replace(/[$,]/g, ''));
                    return sum + collateralNum;
                }, 0);

                return {
                    success: true,
                    message: `Retrieved ${enhancedPositions.length} positions with complete analysis`,
                    positions: enhancedPositions,
                    summary: {
                        totalPositions: enhancedPositions.length,
                        totalSizeUsd: `$${totalSizeUsd.toFixed(2)}`,
                        totalCollateral: `$${totalCollateral.toFixed(2)}`,
                        totalPnl: `$${totalPnl.toFixed(2)}`,
                        avgLeverage: enhancedPositions.length > 0 ? 
                            `${(enhancedPositions.reduce((sum, pos) => 
                                sum + parseFloat(pos.leverage.replace('x', '')), 0) / enhancedPositions.length).toFixed(2)}x` : 
                            "0x"
                    },
                    error: positionsResult.error ? positionsResult.error.message : null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch positions with enhanced calculations"
                };
            }
        }
    }),

    // Orders (Official SDK Method) - Enhanced with Comprehensive Calculations
    action({
        name: "get_orders",
        description: "Get all pending orders with comprehensive analysis including PnL calculations, risk metrics, and market context",
        async handler(data, ctx, agent) {
            try {
                // Get required market and token data first
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Use official SDK method with required parameters
                const ordersResult = await sdk.orders.getOrders({
                    marketsInfoData,
                    tokensData
                });
                
                const memory = ctx.memory as GmxMemory;
                
                // Extract orders data from structured result
                const rawOrders = ordersResult.ordersInfoData ? Object.values(ordersResult.ordersInfoData) : [];
                
                // Enhanced orders with comprehensive calculations
                const enhancedOrders = rawOrders.map(order => {
                    try {
                        const marketInfo = marketsInfoData[order.marketAddress];
                        const indexToken = tokensData[marketInfo?.indexTokenAddress];
                        const collateralToken = tokensData[order.collateralTokenAddress];
                        
                        if (!marketInfo || !indexToken || !collateralToken) {
                            return order; // Return original if data missing
                        }
                        
                        // Get current mark price
                        const markPrice = indexToken.prices?.maxPrice || 0n;
                        
                        // Calculate order value in USD
                        const orderValueUsd = bigIntToDecimal(order.sizeInUsd || 0n, USD_DECIMALS);
                        
                        // Calculate trigger price difference from mark price
                        const triggerPrice = order.triggerPrice || 0n;
                        const triggerPriceUsd = bigIntToDecimal(triggerPrice, USD_DECIMALS);
                        const markPriceUsd = bigIntToDecimal(markPrice, USD_DECIMALS);
                        
                        const priceDifference = markPriceUsd - triggerPriceUsd;
                        const priceDifferencePercent = triggerPriceUsd > 0 ? (priceDifference / triggerPriceUsd) * 100 : 0;
                        
                        // Calculate collateral value
                        const collateralValue = bigIntToDecimal(
                            order.initialCollateralDeltaAmount || 0n, 
                            collateralToken.decimals
                        );
                        
                        // Calculate potential leverage (size / collateral)
                        const potentialLeverage = collateralValue > 0 ? orderValueUsd / collateralValue : 0;
                        
                        // Calculate order age
                        const createdAt = order.createdAtTime ? Number(order.createdAtTime) : 0;
                        const orderAge = createdAt > 0 ? Date.now() / 1000 - createdAt : 0;
                        const orderAgeHours = orderAge / 3600;
                        
                        // Determine order status and execution probability
                        let executionStatus = "Pending";
                        let executionProbability = 0;
                        
                        if (order.isLong !== undefined) {
                            if (order.isLong) {
                                // Long order - executes when price goes up to trigger
                                if (markPriceUsd >= triggerPriceUsd) {
                                    executionStatus = "Ready to Execute";
                                    executionProbability = 100;
                                } else {
                                    const distanceToTrigger = (triggerPriceUsd - markPriceUsd) / markPriceUsd * 100;
                                    executionProbability = Math.max(0, 100 - distanceToTrigger * 10);
                                }
                            } else {
                                // Short order - executes when price goes down to trigger
                                if (markPriceUsd <= triggerPriceUsd) {
                                    executionStatus = "Ready to Execute";
                                    executionProbability = 100;
                                } else {
                                    const distanceToTrigger = (markPriceUsd - triggerPriceUsd) / markPriceUsd * 100;
                                    executionProbability = Math.max(0, 100 - distanceToTrigger * 10);
                                }
                            }
                        }
                        
                        // Calculate potential liquidation price if order executes
                        let potentialLiquidationPrice = null;
                        if (order.sizeInUsd && order.initialCollateralDeltaAmount && marketInfo.minCollateralFactor) {
                            try {
                                const sizeInTokens = convertToTokens(
                                    order.sizeInUsd,
                                    indexToken.decimals,
                                    markPrice
                                );
                                
                                const liquidationPriceRaw = calculateLiquidationPrice({
                                    sizeInUsd: order.sizeInUsd,
                                    sizeInTokens,
                                    collateralUsd: convertToUsd(
                                        order.initialCollateralDeltaAmount,
                                        collateralToken.decimals,
                                        collateralToken.prices?.maxPrice || 0n
                                    ),
                                    isLong: order.isLong || false,
                                    markPrice,
                                    minCollateralFactor: marketInfo.minCollateralFactor,
                                    indexTokenDecimals: indexToken.decimals
                                });
                                
                                if (liquidationPriceRaw) {
                                    potentialLiquidationPrice = bigIntToDecimal(liquidationPriceRaw, USD_DECIMALS);
                                }
                            } catch (error) {
                                console.warn("Failed to calculate liquidation price for order:", error);
                            }
                        }
                        
                        // Calculate risk metrics
                        const riskLevel = potentialLeverage > 10 ? "High" : 
                                        potentialLeverage > 5 ? "Medium" : "Low";
                        
                        // Enhanced order data
                        return {
                            ...order,
                            // Market context
                            marketName: marketInfo.name,
                            indexTokenSymbol: indexToken.symbol,
                            collateralTokenSymbol: collateralToken.symbol,
                            
                            // Price analysis
                            currentPrice: markPriceUsd.toFixed(6),
                            triggerPrice: triggerPriceUsd.toFixed(6),
                            priceDifference: priceDifference.toFixed(6),
                            priceDifferencePercent: priceDifferencePercent.toFixed(2) + '%',
                            
                            // Order metrics
                            orderValueUsd: orderValueUsd.toFixed(2),
                            collateralValueUsd: collateralValue.toFixed(6),
                            potentialLeverage: potentialLeverage.toFixed(2) + 'x',
                            
                            // Execution analysis
                            executionStatus,
                            executionProbability: executionProbability.toFixed(1) + '%',
                            orderAge: orderAgeHours.toFixed(1) + ' hours',
                            
                            // Risk analysis
                            riskLevel,
                            potentialLiquidationPrice: potentialLiquidationPrice ? 
                                potentialLiquidationPrice.toFixed(6) : 'N/A',
                            
                            // Order type description
                            orderTypeDescription: getOrderTypeDescription(order.orderType),
                            
                            // Calculate distance to liquidation if executed
                            liquidationDistance: potentialLiquidationPrice && markPriceUsd > 0 ? 
                                (Math.abs(markPriceUsd - potentialLiquidationPrice) / markPriceUsd * 100).toFixed(2) + '%' : 'N/A'
                        };
                    } catch (error) {
                        console.warn("Error enhancing order data:", error);
                        return order; // Return original order if enhancement fails
                    }
                });
                
                // Calculate portfolio summary for orders
                const totalOrderValue = enhancedOrders.reduce((sum, order) => 
                    sum + parseFloat(order.orderValueUsd || '0'), 0);
                
                const averageLeverage = enhancedOrders.length > 0 ? 
                    enhancedOrders.reduce((sum, order) => 
                        sum + parseFloat(order.potentialLeverage?.replace('x', '') || '0'), 0) / enhancedOrders.length : 0;
                
                const highRiskOrders = enhancedOrders.filter(order => order.riskLevel === 'High').length;
                const readyToExecute = enhancedOrders.filter(order => order.executionStatus === 'Ready to Execute').length;
                
                // Update memory with enhanced orders
                memory.orders = enhancedOrders;
                memory.currentTask = "Analyzed orders";
                memory.lastResult = `Retrieved ${enhancedOrders.length} orders with comprehensive analysis`;

                return {
                    success: true,
                    message: `Retrieved ${enhancedOrders.length} orders with comprehensive analysis`,
                    orders: enhancedOrders,
                    summary: {
                        totalOrders: enhancedOrders.length,
                        totalOrderValue: '$' + totalOrderValue.toFixed(2),
                        averageLeverage: averageLeverage.toFixed(2) + 'x',
                        highRiskOrders,
                        readyToExecute,
                        orderTypes: enhancedOrders.reduce((acc, order) => {
                            const type = order.orderTypeDescription || 'Unknown';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>)
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch orders"
                };
            }
        }
    }),


    // Trade History (Official SDK Method) - Enhanced with Comprehensive Analytics
    action({
        name: "get_trade_history",
        description: "Get trading history with comprehensive analytics including advanced PnL calculations, liquidation prices, and portfolio-level metrics",
        schema: z.object({
            pageSize: z.number().optional().default(100).describe("Number of trades per page"),
            pageIndex: z.number().optional().default(0).describe("Page index for pagination"),
            fromTxTimestamp: z.number().optional().describe("Start timestamp (Unix timestamp)"),
            toTxTimestamp: z.number().optional().describe("End timestamp (Unix timestamp)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Set default time range if not provided (last 365 days)
                const now = Math.floor(Date.now() / 1000);
                const lastYear = now - (365 * 24 * 60 * 60);
                
                // Get market and token data first (required for trade history)
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Create params for trade history request with required dependencies
                const params = {
                    pageSize: data.pageSize || 100,
                    pageIndex: data.pageIndex || 0,
                    fromTxTimestamp: data.fromTxTimestamp || lastYear,
                    toTxTimestamp: data.toTxTimestamp || now,
                    marketsInfoData,
                    tokensData
                };
                
                // Fetch trade history using the SDK
                const tradeActions = await sdk.trades.getTradeHistory(params);
                
                // Process trades for comprehensive analysis
                const simplifiedTrades: any[] = [];
                const tradeMetrics = {
                    totalPnl: 0,
                    totalVolume: 0,
                    totalFees: 0,
                    winCount: 0,
                    totalWins: 0,
                    lossCount: 0,
                    totalLosses: 0,
                    maxWin: 0,
                    maxLoss: 0,
                    totalTradeDuration: 0,
                    slippageAnalysis: { total: 0, count: 0 },
                    marketsTraded: new Set<string>(),
                    profitByMarket: {} as Record<string, number>,
                    volumeByMarket: {} as Record<string, number>,
                    tradesByDay: {} as Record<string, number>
                };
                
                tradeActions.forEach(trade => {
                    try {
                        if (!trade) return;
                        
                        const tradeDate = new Date(trade.transaction.timestamp * 1000);
                        const tradeDateStr = tradeDate.toISOString().split('T')[0];
                        tradeMetrics.tradesByDay[tradeDateStr] = (tradeMetrics.tradesByDay[tradeDateStr] || 0) + 1;
                        
                        // Common properties for all trade types
                        const baseTradeInfo = {
                            id: trade.id,
                            timestamp: tradeDate.toLocaleString(),
                            txHash: trade.transaction.hash,
                            eventName: trade.eventName,
                            orderType: trade.orderType,
                            orderKey: trade.orderKey,
                            blockNumber: trade.transaction.blockNumber
                        };
                        
                        // Process position trades (non-swap trades)
                        if ('marketInfo' in trade) {
                            const positionTrade = trade;
                            
                            // Extract market and token info
                            const marketInfo = positionTrade.marketInfo;
                            const indexToken = positionTrade.indexToken.symbol;
                            const isLong = positionTrade.isLong;
                            const side = isLong ? 'LONG' : 'SHORT';
                            
                            // Track markets traded
                            tradeMetrics.marketsTraded.add(marketInfo.name);
                            
                            // Convert BigInt values to human-readable numbers
                            const sizeUsd = bigIntToDecimal(positionTrade.sizeDeltaUsd, USD_DECIMALS);
                            tradeMetrics.totalVolume += sizeUsd;
                            
                            // Update volume by market
                            tradeMetrics.volumeByMarket[marketInfo.name] = 
                                (tradeMetrics.volumeByMarket[marketInfo.name] || 0) + sizeUsd;
                            
                            // Get prices with proper decimal handling
                            const executionPrice = positionTrade.executionPrice 
                                ? bigIntToDecimal(positionTrade.executionPrice, USD_DECIMALS)
                                : 0;
                            
                            const triggerPrice = positionTrade.triggerPrice
                                ? bigIntToDecimal(positionTrade.triggerPrice, USD_DECIMALS)
                                : 0;
                            
                            const price = executionPrice || triggerPrice;
                            
                            // Calculate slippage if both prices available
                            let slippage = 0;
                            if (triggerPrice > 0 && executionPrice > 0) {
                                slippage = Math.abs(executionPrice - triggerPrice) / triggerPrice * 100;
                                tradeMetrics.slippageAnalysis.total += slippage;
                                tradeMetrics.slippageAnalysis.count++;
                            }
                            
                            // Calculate comprehensive PnL metrics
                            let pnlUsd = 0;
                            let pnlPercentage = 0;
                            let realizedPnl = 0;
                            let unrealizedPnl = 0;
                            
                            if (positionTrade.pnlUsd) {
                                pnlUsd = bigIntToDecimal(positionTrade.pnlUsd, USD_DECIMALS);
                                realizedPnl = pnlUsd; // For closed positions, this is realized
                                
                                // Calculate PnL percentage based on collateral
                                const collateralUsd = bigIntToDecimal(
                                    positionTrade.initialCollateralDeltaAmount || 0n,
                                    positionTrade.initialCollateralToken.decimals
                                ) * (positionTrade.initialCollateralToken.prices?.maxPrice ?
                                    bigIntToDecimal(positionTrade.initialCollateralToken.prices.maxPrice, USD_DECIMALS) : 1);
                                
                                if (collateralUsd > 0) {
                                    pnlPercentage = (pnlUsd / collateralUsd) * 100;
                                }
                                
                                // Update comprehensive statistics
                                tradeMetrics.totalPnl += pnlUsd;
                                tradeMetrics.profitByMarket[marketInfo.name] = 
                                    (tradeMetrics.profitByMarket[marketInfo.name] || 0) + pnlUsd;
                                
                                if (pnlUsd > 0) {
                                    tradeMetrics.winCount++;
                                    tradeMetrics.totalWins += pnlUsd;
                                    tradeMetrics.maxWin = Math.max(tradeMetrics.maxWin, pnlUsd);
                                } else if (pnlUsd < 0) {
                                    tradeMetrics.lossCount++;
                                    tradeMetrics.totalLosses += Math.abs(pnlUsd);
                                    tradeMetrics.maxLoss = Math.min(tradeMetrics.maxLoss, pnlUsd);
                                }
                            }
                            
                            // Calculate comprehensive fees
                            const fees = {
                                positionFee: positionTrade.positionFeeAmount 
                                    ? bigIntToDecimal(positionTrade.positionFeeAmount, USD_DECIMALS) 
                                    : 0,
                                borrowingFee: positionTrade.borrowingFeeAmount 
                                    ? bigIntToDecimal(positionTrade.borrowingFeeAmount, USD_DECIMALS) 
                                    : 0,
                                fundingFee: positionTrade.fundingFeeAmount 
                                    ? bigIntToDecimal(positionTrade.fundingFeeAmount, USD_DECIMALS) 
                                    : 0,
                                uiFee: positionTrade.uiFeeAmount 
                                    ? bigIntToDecimal(positionTrade.uiFeeAmount, USD_DECIMALS) 
                                    : 0
                            };
                            
                            const totalFees = fees.positionFee + fees.borrowingFee + fees.fundingFee + fees.uiFee;
                            tradeMetrics.totalFees += totalFees;
                            
                            // Calculate theoretical liquidation price for this trade
                            let liquidationPrice = null;
                            let distanceToLiquidation = null;
                            
                            if (positionTrade.sizeDeltaUsd && positionTrade.initialCollateralDeltaAmount) {
                                try {
                                    const sizeInTokens = convertToTokenAmount(
                                        positionTrade.sizeDeltaUsd,
                                        positionTrade.indexToken.decimals,
                                        positionTrade.indexToken.prices?.maxPrice || 0n
                                    );
                                    
                                    const collateralUsd = convertToUsd(
                                        positionTrade.initialCollateralDeltaAmount,
                                        positionTrade.initialCollateralToken.decimals,
                                        positionTrade.initialCollateralToken.prices?.maxPrice || 0n
                                    );
                                    
                                    if (!sizeInTokens || !collateralUsd) {
                                        throw new Error("Failed to convert values");
                                    }
                                    
                                    const collateralAmount = positionTrade.initialCollateralDeltaAmount;
                                    const isSameCollateralAsIndex = positionTrade.initialCollateralToken.address === positionTrade.indexToken.address;
                                    
                                    const liquidationPriceRaw = calculateLiquidationPrice({
                                        sizeInUsd: positionTrade.sizeDeltaUsd,
                                        sizeInTokens,
                                        collateralAmount,
                                        collateralUsd,
                                        markPrice: positionTrade.indexToken.prices?.maxPrice || 0n,
                                        indexTokenDecimals: positionTrade.indexToken.decimals,
                                        collateralTokenDecimals: positionTrade.initialCollateralToken.decimals,
                                        isLong,
                                        minCollateralFactor: marketInfo.minCollateralFactor || 1000n,
                                        pendingBorrowingFeesUsd: 0n, // Not available in historical trade data
                                        pendingFundingFeesUsd: 0n,   // Not available in historical trade data
                                        isSameCollateralAsIndex
                                    });
                                    
                                    if (liquidationPriceRaw) {
                                        liquidationPrice = bigIntToDecimal(liquidationPriceRaw, USD_DECIMALS);
                                        if (price > 0) {
                                            distanceToLiquidation = Math.abs(price - liquidationPrice) / price * 100;
                                        }
                                    }
                                } catch (error) {
                                    console.warn("Failed to calculate liquidation price for trade:", error);
                                }
                            }
                            
                            // Calculate leverage used
                            const collateralAmount = bigIntToDecimal(
                                positionTrade.initialCollateralDeltaAmount || 0n,
                                positionTrade.initialCollateralToken.decimals
                            );
                            
                            const collateralUsdValue = collateralAmount * 
                                (positionTrade.initialCollateralToken.prices?.maxPrice ? 
                                    bigIntToDecimal(positionTrade.initialCollateralToken.prices.maxPrice, USD_DECIMALS) : 1);
                            
                            const leverage = collateralUsdValue > 0 ? sizeUsd / collateralUsdValue : 0;
                            
                            // Calculate ROI (Return on Investment)
                            const roi = collateralUsdValue > 0 ? (pnlUsd / collateralUsdValue) * 100 : 0;
                            
                            // Add enhanced trade to simplified trades array
                            simplifiedTrades.push({
                                ...baseTradeInfo,
                                type: 'Position',
                                market: marketInfo.name,
                                marketAddress: positionTrade.marketAddress,
                                indexToken,
                                side,
                                size: '$' + sizeUsd.toFixed(2),
                                executionPrice: '$' + executionPrice.toFixed(6),
                                triggerPrice: triggerPrice > 0 ? '$' + triggerPrice.toFixed(6) : 'N/A',
                                slippage: slippage > 0 ? slippage.toFixed(4) + '%' : 'N/A',
                                collateral: {
                                    token: positionTrade.initialCollateralToken.symbol,
                                    amount: collateralAmount.toFixed(6),
                                    usdValue: '$' + collateralUsdValue.toFixed(2)
                                },
                                leverage: leverage.toFixed(2) + 'x',
                                pnl: {
                                    usd: '$' + pnlUsd.toFixed(2),
                                    percentage: pnlPercentage.toFixed(2) + '%',
                                    realized: '$' + realizedPnl.toFixed(2),
                                    unrealized: '$' + unrealizedPnl.toFixed(2)
                                },
                                roi: roi.toFixed(2) + '%',
                                fees: {
                                    ...fees,
                                    total: '$' + totalFees.toFixed(4)
                                },
                                liquidationPrice: liquidationPrice ? '$' + liquidationPrice.toFixed(6) : 'N/A',
                                distanceToLiquidation: distanceToLiquidation ? distanceToLiquidation.toFixed(2) + '%' : 'N/A',
                                action: getTradeActionDescription(trade.eventName, trade.orderType, isLong),
                                riskLevel: leverage > 10 ? 'High' : leverage > 5 ? 'Medium' : 'Low'
                            });
                        } 
                        // Process swap trades with enhanced analysis
                        else if ('targetCollateralToken' in trade) {
                            const swapTrade = trade;
                            
                            const fromToken = swapTrade.initialCollateralToken;
                            const toToken = swapTrade.targetCollateralToken;
                            
                            const amountIn = bigIntToDecimal(
                                swapTrade.initialCollateralDeltaAmount, 
                                fromToken.decimals
                            );
                            
                            const amountOut = swapTrade.executionAmountOut 
                                ? bigIntToDecimal(swapTrade.executionAmountOut, toToken.decimals)
                                : 0;
                            
                            // Calculate swap efficiency
                            const fromPriceUsd = fromToken.prices?.maxPrice ? 
                                bigIntToDecimal(fromToken.prices.maxPrice, USD_DECIMALS) : 0;
                            const toPriceUsd = toToken.prices?.maxPrice ? 
                                bigIntToDecimal(toToken.prices.maxPrice, USD_DECIMALS) : 0;
                            
                            const expectedAmountOut = fromPriceUsd > 0 && toPriceUsd > 0 ? 
                                (amountIn * fromPriceUsd) / toPriceUsd : 0;
                            
                            const swapEfficiency = expectedAmountOut > 0 ? 
                                (amountOut / expectedAmountOut) * 100 : 0;
                            
                            const swapVolumeUsd = amountIn * fromPriceUsd;
                            tradeMetrics.totalVolume += swapVolumeUsd;
                            
                            // Add enhanced swap to simplified trades array
                            simplifiedTrades.push({
                                ...baseTradeInfo,
                                type: 'Swap',
                                fromToken: fromToken.symbol,
                                toToken: toToken.symbol,
                                amountIn: amountIn.toFixed(6),
                                amountOut: amountOut.toFixed(6),
                                volumeUsd: '$' + swapVolumeUsd.toFixed(2),
                                expectedAmountOut: expectedAmountOut.toFixed(6),
                                swapEfficiency: swapEfficiency.toFixed(2) + '%',
                                priceImpact: (100 - swapEfficiency).toFixed(2) + '%',
                                action: getTradeActionDescription(trade.eventName, trade.orderType, false)
                            });
                        }
                    } catch (err) {
                        console.error("Error processing trade:", err);
                        // Continue to next trade
                    }
                });
                
                // Calculate comprehensive performance metrics
                const tradeCount = simplifiedTrades.length;
                const winRate = tradeCount > 0 ? (tradeMetrics.winCount / tradeCount) * 100 : 0;
                const averageProfit = tradeMetrics.winCount > 0 ? tradeMetrics.totalWins / tradeMetrics.winCount : 0;
                const averageLoss = tradeMetrics.lossCount > 0 ? tradeMetrics.totalLosses / tradeMetrics.lossCount : 0;
                const profitFactor = tradeMetrics.totalLosses > 0 ? tradeMetrics.totalWins / tradeMetrics.totalLosses : 
                    tradeMetrics.totalWins > 0 ? Infinity : 0;
                
                const averageSlippage = tradeMetrics.slippageAnalysis.count > 0 ? 
                    tradeMetrics.slippageAnalysis.total / tradeMetrics.slippageAnalysis.count : 0;
                
                const netPnl = tradeMetrics.totalPnl - tradeMetrics.totalFees;
                const feeRatio = tradeMetrics.totalVolume > 0 ? (tradeMetrics.totalFees / tradeMetrics.totalVolume) * 100 : 0;
                
                // Calculate Sharpe-like ratio (simplified)
                const returns = simplifiedTrades
                    .filter(t => t.type === 'Position' && t.pnl?.usd)
                    .map(t => parseFloat(t.pnl.usd.replace('$', '')));
                
                const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
                const returnStdDev = returns.length > 1 ? 
                    Math.sqrt(returns.reduce((acc, ret) => acc + Math.pow(ret - avgReturn, 2), 0) / (returns.length - 1)) : 0;
                
                const riskAdjustedReturn = returnStdDev > 0 ? avgReturn / returnStdDev : 0;
                
                // Update memory with comprehensive data
                const memory = ctx.memory as GmxMemory;
                memory.trades = simplifiedTrades;
                memory.totalPnl = tradeMetrics.totalPnl;
                memory.winRate = winRate;
                memory.averageProfit = averageProfit;
                memory.averageLoss = averageLoss;
                memory.currentTask = "getAccountStats";
                memory.lastResult = `Retrieved trading history with ${simplifiedTrades.length} trades, total PnL: ${tradeMetrics.totalPnl.toFixed(2)}, win rate: ${winRate}%`;
                
                return {
                    success: true,
                    message: `Retrieved ${simplifiedTrades.length} trades with comprehensive analytics from ${new Date((data.fromTxTimestamp || lastYear) * 1000).toLocaleDateString()} to ${new Date((data.toTxTimestamp || now) * 1000).toLocaleDateString()}`,
                    trades: simplifiedTrades,
                    analytics: {
                        basicMetrics: {
                            totalPnl: '$' + tradeMetrics.totalPnl.toFixed(2),
                            netPnl: '$' + netPnl.toFixed(2),
                            totalVolume: '$' + tradeMetrics.totalVolume.toFixed(2),
                            totalFees: '$' + tradeMetrics.totalFees.toFixed(2),
                            feeRatio: feeRatio.toFixed(3) + '%',
                            winRate: winRate.toFixed(2) + '%',
                            profitFactor: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
                            tradeCount,
                            winCount: tradeMetrics.winCount,
                            lossCount: tradeMetrics.lossCount
                        },
                        advancedMetrics: {
                            averageProfit: '$' + averageProfit.toFixed(2),
                            averageLoss: '$' + averageLoss.toFixed(2),
                            maxWin: '$' + tradeMetrics.maxWin.toFixed(2),
                            maxLoss: '$' + tradeMetrics.maxLoss.toFixed(2),
                            averageSlippage: averageSlippage.toFixed(4) + '%',
                            riskAdjustedReturn: riskAdjustedReturn.toFixed(2),
                            returnVolatility: returnStdDev.toFixed(2)
                        },
                        portfolioAnalysis: {
                            marketsTraded: Array.from(tradeMetrics.marketsTraded),
                            profitByMarket: Object.entries(tradeMetrics.profitByMarket)
                                .map(([market, profit]) => ({ market, profit: '$' + profit.toFixed(2) }))
                                .sort((a, b) => parseFloat(b.profit.replace('$', '')) - parseFloat(a.profit.replace('$', ''))),
                            volumeByMarket: Object.entries(tradeMetrics.volumeByMarket)
                                .map(([market, volume]) => ({ market, volume: '$' + volume.toFixed(2) }))
                                .sort((a, b) => parseFloat(b.volume.replace('$', '')) - parseFloat(a.volume.replace('$', ''))),
                            dailyActivity: Object.entries(tradeMetrics.tradesByDay)
                                .map(([date, count]) => ({ date, trades: count }))
                                .sort((a, b) => a.date.localeCompare(b.date))
                        },
                        tradingPeriod: {
                            from: new Date((data.fromTxTimestamp || lastYear) * 1000).toLocaleDateString(),
                            to: new Date((data.toTxTimestamp || now) * 1000).toLocaleDateString(),
                            durationDays: Math.ceil(((data.toTxTimestamp || now) - (data.fromTxTimestamp || lastYear)) / (24 * 60 * 60))
                        }
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch trade history"
                };
            }
        }
    }),

    // ═══════════════════════════════════════════════════════════════════════════════
    // 🧠 SYNTH MARKET INTELLIGENCE & PREDICTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    // Current Leaderboard - Top Performing Miners
    action({
        name: "get_synth_leaderboard",
        description: "Get current leaderboard of top-performing Synth miners with performance metrics",
        async handler(data, ctx, agent) {
            try {
                const response = await fetch('https://dashboard.synthdata.co/api/leaderboard/');

                if (!response.ok) {
                    throw new Error(`Synth API error: ${response.status} ${response.statusText}`);
                }

                const leaderboard = await response.json();
                
                const memory = ctx.memory as GmxMemory;
                
                // Slice to get only the top 5 miners
                const limitedLeaderboard = Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : leaderboard;
                
                // Update memory with leaderboard data
                memory.synthLeaderboard = {
                    miners: limitedLeaderboard,
                    lastUpdated: new Date().toISOString(),
                    topMinerIds: limitedLeaderboard.map((miner: any) => miner.uid || miner.id).filter(Boolean)
                };
                memory.currentTask = "getSynthLeaderboard";
                memory.lastResult = `Retrieved Synth leaderboard with ${limitedLeaderboard.length || 0} miners`;

                return {
                    success: true,
                    message: `Retrieved Synth miner leaderboard`,
                    data: {
                        leaderboard: limitedLeaderboard,
                        timestamp: new Date().toISOString(),
                        metrics_included: ["rank", "stake", "incentive", "performance"],
                        source: "synth_network"
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to fetch Synth leaderboard"
                };
            }
        }
    }),

    // Latest Prediction Rates - Real-time Market Intelligence
    action({
        name: "get_latest_predictions",
        description: "Get real-time prediction data from specific Synth miners for current market intelligence",
        schema: z.object({
            asset: z.enum(["BTC", "ETH"]).default("BTC").describe("Asset symbol (BTC or ETH)"),
            miner: z.number().describe("Miner ID (required - get from leaderboard first)")
        }),
        async handler(data, ctx, agent) {
            try {
                // Miner ID is required for this endpoint
                if (!data.miner || data.miner <= 0) {
                    throw new Error('Valid Miner ID is required. Please call get_synth_leaderboard first to get active miner IDs.');
                }
                let url = `https://dashboard.synthdata.co/api/predictionLatest/?asset=${data.asset}&miner=${data.miner}`;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Apikey ${env.SYNTH_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Synth API error: ${response.status} ${response.statusText} - ${errorText}`);
                }

                const predictions = await response.json();
                // Extract the next 144 predictions from prediction array
                // Based on API structure: predictions[0].prediction contains array of prediction values
                const predictionData = predictions[0].prediction[0];

                const memory = ctx.memory as GmxMemory;

                // Update memory with latest prediction data - ensure synthPredictions exists
                if (!memory.synthPredictions) {
                    memory.synthPredictions = {};
                }
                if (!memory.synthPredictions[data.asset]) {
                    memory.synthPredictions[data.asset] = {};
                }
                memory.synthPredictions[data.asset][data.miner] = {
                    predictions: predictionData,
                    lastUpdated: new Date().toISOString(),
                    asset: data.asset,
                    minerId: data.miner
                };
                
                memory.currentTask = "getLatestPredictions";
                memory.lastResult = `Retrieved ${predictionData.length} ${data.asset} predictions from miner ${data.miner}`;

                return {
                    success: true,
                    message: `Retrieved ${predictionData.length} latest ${data.asset} predictions from miner ${data.miner}`,
                    data: {
                        asset: data.asset,
                        miner: data.miner,
                        predictions: predictionData,
                        totalPredictions: predictionData.length,
                        quality: "real_time",
                        source: "synth_selected_miners"
                    }
                };
            } catch (error) {
                // Enhanced error handling for API issues
                const errorMessage = error instanceof Error ? error.message : String(error);
                
                // Handle specific API errors
                if (errorMessage.includes('500') && errorMessage.includes('Failed to fetch liquidation data')) {
                    return {
                        success: false,
                        error: errorMessage,
                        message: "Synth API is experiencing server issues (500 error). This may be temporary - try again later.",
                        suggestion: "Check if the miner ID is valid by calling get_synth_leaderboard first"
                    };
                }
                
                return {
                    success: false,
                    error: errorMessage,
                    message: "Failed to fetch latest predictions from Synth",
                    suggestion: "Verify the asset (BTC/ETH) and miner ID are correct"
                };
            }
        }
    }),

    // ═══════════════════════════════════════════════════════════════════════════════
    // ✍️ WRITE METHODS - TRADING ACTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    // Cancel Orders (Official SDK Method)
    action({
        name: "cancel_orders",
        description: "Cancel one or more pending orders using GMX SDK",
        schema: z.object({
            orderKeys: z.array(z.string()).describe("Array of order keys to cancel"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Use SDK's internal cancelOrders method (no manual wallet client needed)
                const result = await sdk.orders.cancelOrders(data.orderKeys);

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with cancellation info
                memory.currentTask = "cancelOrders";
                memory.lastResult = `Cancelled ${data.orderKeys.length} order(s)`;

                return {
                    success: true,
                    message: `Successfully cancelled ${data.orderKeys.length} order(s)`,
                    orderKeys: data.orderKeys,
                    transactionHash: result?.transactionHash || result?.hash || null,
                    details: {
                        cancelledOrderCount: data.orderKeys.length,
                        orderKeys: data.orderKeys
                    }
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to cancel orders"
                };
            }
        }
    }),

    // Helper: Open Long Position (Simplified)
    action({
        name: "open_long_position",
        description: "Open a long position using GMX helper function (easier to use)",
        schema: z.object({
            payAmount: z.string().describe("Amount to pay (in token decimals)"),
            marketAddress: z.string().describe("Market address (e.g. ETH/USD market)"),
            payTokenAddress: z.string().describe("Token address you're paying with"),
            collateralTokenAddress: z.string().describe("Token address for collateral"),
            allowedSlippageBps: z.number().default(125).describe("Allowed slippage in basis points (default: 125 = 1.25%)"),
            leverage: z.string().describe("Leverage in basis points (e.g. 50000 = 5x leverage)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Get market and token data for proper fee calculation
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo().catch(error => {
                    throw new Error(`Failed to get market data: ${error.message || error}`);
                });
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Invalid market data received");
                }
                
                // Validate market exists
                const marketInfo = marketsInfoData[data.marketAddress];
                if (!marketInfo) {
                    throw new Error(`Market not found: ${data.marketAddress}`);
                }
                
                // Validate tokens exist
                const payToken = tokensData[data.payTokenAddress];
                const collateralToken = tokensData[data.collateralTokenAddress];
                
                if (!payToken) {
                    throw new Error(`Pay token not found: ${data.payTokenAddress}`);
                }
                
                if (!collateralToken) {
                    throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                }
                
                // Use the simplified helper function with enhanced error handling
                const result = await sdk.orders.long({
                    payAmount: BigInt(data.payAmount),
                    marketAddress: data.marketAddress,
                    payTokenAddress: data.payTokenAddress,
                    collateralTokenAddress: data.collateralTokenAddress,
                    allowedSlippageBps: data.allowedSlippageBps,
                    leverage: BigInt(data.leverage),
                }).catch(error => {
                    // Enhanced error parsing for trading operations
                    let errorMessage = "Failed to open long position";
                    
                    if (error?.message?.includes("insufficient")) {
                        errorMessage = "Insufficient balance or allowance";
                    } else if (error?.message?.includes("slippage")) {
                        errorMessage = "Slippage tolerance exceeded";
                    } else if (error?.message?.includes("leverage")) {
                        errorMessage = "Invalid leverage amount";
                    } else if (error?.message?.includes("market")) {
                        errorMessage = "Market temporarily unavailable";
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    
                    throw new Error(errorMessage);
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with order info
                const leverageX = parseFloat(data.leverage) / 10000;
                memory.currentTask = "openLongPosition";
                memory.lastResult = `Opened long position with ${leverageX}x leverage`;

                return {
                    success: true,
                    message: `Successfully opened long position with ${leverageX}x leverage`,
                    orderDetails: {
                        marketAddress: data.marketAddress,
                        direction: 'LONG',
                        payAmount: data.payAmount,
                        payToken: data.payTokenAddress,
                        collateralToken: data.collateralTokenAddress,
                        leverage: `${leverageX}x`,
                        slippage: `${data.allowedSlippageBps / 100}%`
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to open long position"
                };
            }
        }
    }),

    // Helper: Open Short Position (Simplified)
    action({
        name: "open_short_position", 
        description: "Open a short position using GMX helper function (easier to use)",
        schema: z.object({
            payAmount: z.string().describe("Amount to pay (in token decimals)"),
            marketAddress: z.string().describe("Market address (e.g. ETH/USD market)"),
            payTokenAddress: z.string().describe("Token address you're paying with"),
            collateralTokenAddress: z.string().describe("Token address for collateral"),
            allowedSlippageBps: z.number().default(125).describe("Allowed slippage in basis points (default: 125 = 1.25%)"),
            leverage: z.string().describe("Leverage in basis points (e.g. 50000 = 5x leverage)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Get market and token data for validation and proper error handling
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo().catch(error => {
                    throw new Error(`Failed to get market data: ${error.message || error}`);
                });
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Invalid market data received");
                }
                
                // Validate market and tokens exist
                const marketInfo = marketsInfoData[data.marketAddress];
                if (!marketInfo) {
                    throw new Error(`Market not found: ${data.marketAddress}`);
                }
                
                const payToken = tokensData[data.payTokenAddress];
                const collateralToken = tokensData[data.collateralTokenAddress];
                
                if (!payToken || !collateralToken) {
                    throw new Error("Invalid token addresses provided");
                }
                
                // Use the simplified helper function with enhanced error handling
                const result = await sdk.orders.short({
                    payAmount: BigInt(data.payAmount),
                    marketAddress: data.marketAddress,
                    payTokenAddress: data.payTokenAddress,
                    collateralTokenAddress: data.collateralTokenAddress,
                    allowedSlippageBps: data.allowedSlippageBps,
                    leverage: BigInt(data.leverage),
                }).catch(error => {
                    // Enhanced error parsing for short positions
                    let errorMessage = "Failed to open short position";
                    
                    if (error?.message?.includes("insufficient")) {
                        errorMessage = "Insufficient balance or allowance";
                    } else if (error?.message?.includes("slippage")) {
                        errorMessage = "Slippage tolerance exceeded";
                    } else if (error?.message?.includes("leverage")) {
                        errorMessage = "Invalid leverage amount";
                    } else if (error?.message?.includes("borrowing")) {
                        errorMessage = "Borrowing capacity exceeded";
                    } else if (error?.message) {
                        errorMessage = error.message;
                    }
                    
                    throw new Error(errorMessage);
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with order info
                const leverageX = parseFloat(data.leverage) / 10000;
                memory.currentTask = "openShortPosition";
                memory.lastResult = `Opened short position with ${leverageX}x leverage`;

                return {
                    success: true,
                    message: `Successfully opened short position with ${leverageX}x leverage`,
                    orderDetails: {
                        marketAddress: data.marketAddress,
                        direction: 'SHORT',
                        payAmount: data.payAmount,
                        payToken: data.payTokenAddress,
                        collateralToken: data.collateralTokenAddress,
                        leverage: `${leverageX}x`,
                        slippage: `${data.allowedSlippageBps / 100}%`
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to open short position"
                };
            }
        }
    }),

    // Helper: Token Swap (Simplified)
    action({
        name: "swap_tokens",
        description: "Swap tokens using GMX helper function (easier to use)",
        schema: z.object({
            fromAmount: z.string().describe("Amount to swap from (in token decimals)"),
            fromTokenAddress: z.string().describe("Token address to swap from"),
            toTokenAddress: z.string().describe("Token address to swap to"),
            allowedSlippageBps: z.number().default(125).describe("Allowed slippage in basis points (default: 125 = 1.25%)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Use the simplified helper function
                const result = await sdk.orders.swap({
                    fromAmount: BigInt(data.fromAmount),
                    fromTokenAddress: data.fromTokenAddress,
                    toTokenAddress: data.toTokenAddress,
                    allowedSlippageBps: data.allowedSlippageBps,
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with swap info
                memory.currentTask = "swapTokens";
                memory.lastResult = `Swapped ${data.fromAmount} tokens: ${data.fromTokenAddress} → ${data.toTokenAddress}`;

                return {
                    success: true,
                    message: `Successfully swapped tokens`,
                    swapDetails: {
                        fromToken: data.fromTokenAddress,
                        toToken: data.toTokenAddress,
                        fromAmount: data.fromAmount,
                        slippage: `${data.allowedSlippageBps / 100}%`
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to swap tokens"
                };
            }
        }
    }),

    // Take Profit Order (Official SDK Method)
    action({
        name: "create_take_profit_order",
        description: "Create a take profit order to close position when price reaches target",
        schema: z.object({
            marketAddress: z.string().describe("Market address for the position"),
            collateralTokenAddress: z.string().describe("Collateral token address"),
            isLong: z.boolean().describe("True for long position, false for short position"),
            triggerPrice: z.string().describe("Price that triggers the take profit (in USD with 30 decimals)"),
            sizeDeltaUsd: z.string().describe("Position size to close in USD (30 decimals)"),
            collateralDeltaAmount: z.string().optional().describe("Collateral amount to withdraw (optional)"),
            allowedSlippage: z.number().default(50).describe("Allowed slippage in basis points (default: 50 = 0.5%)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Get required market and token data
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Get market info
                const marketInfo = marketsInfoData[data.marketAddress];
                if (!marketInfo) {
                    throw new Error(`Market not found: ${data.marketAddress}`);
                }

                // Get collateral token info
                const collateralToken = tokensData[data.collateralTokenAddress];
                if (!collateralToken) {
                    throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                }

                // Calculate decrease amounts for take profit
                const sizeDeltaUsd = BigInt(data.sizeDeltaUsd);
                const triggerPrice = BigInt(data.triggerPrice);
                
                // For take profit: acceptable price should be slightly worse than trigger
                // Long TP: sell at trigger price or better (lower acceptable price)
                // Short TP: buy at trigger price or better (higher acceptable price)
                const slippageAmount = (triggerPrice * BigInt(data.allowedSlippage)) / 10000n;
                const acceptablePrice = data.isLong 
                    ? triggerPrice - slippageAmount  // Long: can accept lower price
                    : triggerPrice + slippageAmount; // Short: can accept higher price

                const decreaseAmounts = {
                    sizeDeltaUsd: sizeDeltaUsd,
                    sizeDeltaInTokens: 0n, // Will be calculated by SDK
                    collateralDeltaAmount: data.collateralDeltaAmount ? BigInt(data.collateralDeltaAmount) : 0n,
                    triggerPrice: triggerPrice,
                    acceptablePrice: acceptablePrice,
                    triggerOrderType: 5, // OrderType.LimitDecrease for take profit
                    decreaseSwapType: 0, // No swap by default
                };

                // Create take profit order using SDK
                const result = await sdk.orders.createDecreaseOrder({
                    marketInfo: marketInfo,
                    marketsInfoData: marketsInfoData,
                    tokensData: tokensData,
                    isLong: data.isLong,
                    allowedSlippage: data.allowedSlippage,
                    decreaseAmounts: decreaseAmounts,
                    collateralToken: collateralToken,
                    isTrigger: true, // This makes it a conditional order
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with order info
                const triggerPriceFormatted = data.triggerPrice;
                const sizeUsdFormatted = data.sizeDeltaUsd;
                memory.currentTask = "createTakeProfitOrder";
                memory.lastResult = `Created take profit order: ${data.isLong ? 'Long' : 'Short'} TP at ${triggerPriceFormatted} for $${sizeUsdFormatted}`;

                return {
                    success: true,
                    message: `Successfully created take profit order`,
                    orderDetails: {
                        marketAddress: data.marketAddress,
                        direction: data.isLong ? 'LONG' : 'SHORT',
                        orderType: 'Take Profit',
                        triggerPrice: data.triggerPrice,
                        acceptablePrice: acceptablePrice,
                        sizeUsd: data.sizeDeltaUsd,
                        slippage: data.allowedSlippage / 100
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to create take profit order"
                };
            }
        }
    }),

    // Stop Loss Order (Official SDK Method)
    action({
        name: "create_stop_loss_order",
        description: "Create a stop loss order to close position when price hits stop level",
        schema: z.object({
            marketAddress: z.string().describe("Market address for the position"),
            collateralTokenAddress: z.string().describe("Collateral token address"),
            isLong: z.boolean().describe("True for long position, false for short position"),
            triggerPrice: z.string().describe("Price that triggers the stop loss (in USD with 30 decimals)"),
            sizeDeltaUsd: z.string().describe("Position size to close in USD (30 decimals)"),
            collateralDeltaAmount: z.string().optional().describe("Collateral amount to withdraw (optional)"),
            allowedSlippage: z.number().default(50).describe("Allowed slippage in basis points (default: 50 = 0.5%)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Get required market and token data
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Get market info
                const marketInfo = marketsInfoData[data.marketAddress];
                if (!marketInfo) {
                    throw new Error(`Market not found: ${data.marketAddress}`);
                }

                // Get collateral token info
                const collateralToken = tokensData[data.collateralTokenAddress];
                if (!collateralToken) {
                    throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                }

                // Calculate decrease amounts for stop loss
                const sizeDeltaUsd = BigInt(data.sizeDeltaUsd);
                const triggerPrice = BigInt(data.triggerPrice);
                
                // For stop loss: acceptable price should be worse than trigger (more slippage allowed)
                // Long SL: sell at trigger price or worse (lower acceptable price)
                // Short SL: buy at trigger price or worse (higher acceptable price)
                const slippageAmount = (triggerPrice * BigInt(data.allowedSlippage)) / 10000n;
                const acceptablePrice = data.isLong 
                    ? triggerPrice - slippageAmount  // Long: can accept lower price
                    : triggerPrice + slippageAmount; // Short: can accept higher price

                const decreaseAmounts = {
                    sizeDeltaUsd: sizeDeltaUsd,
                    sizeDeltaInTokens: 0n, // Will be calculated by SDK
                    collateralDeltaAmount: data.collateralDeltaAmount ? BigInt(data.collateralDeltaAmount) : 0n,
                    triggerPrice: triggerPrice,
                    acceptablePrice: acceptablePrice,
                    triggerOrderType: 6, // OrderType.StopLossDecrease for stop loss
                    decreaseSwapType: 0, // No swap by default
                };

                // Create stop loss order using SDK
                const result = await sdk.orders.createDecreaseOrder({
                    marketInfo: marketInfo,
                    marketsInfoData: marketsInfoData,
                    tokensData: tokensData,
                    isLong: data.isLong,
                    allowedSlippage: data.allowedSlippage,
                    decreaseAmounts: decreaseAmounts,
                    collateralToken: collateralToken,
                    isTrigger: true, // This makes it a conditional order
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with order info
                const triggerPriceFormatted = data.triggerPrice;
                const sizeUsdFormatted = data.sizeDeltaUsd;
                memory.currentTask = "createStopLossOrder";
                memory.lastResult = `Created stop loss order: ${data.isLong ? 'Long' : 'Short'} SL at ${triggerPriceFormatted} for $${sizeUsdFormatted}`;

                return {
                    success: true,
                    message: `Successfully created stop loss order`,
                    orderDetails: {
                        marketAddress: data.marketAddress,
                        direction: data.isLong ? 'LONG' : 'SHORT',
                        orderType: 'Stop Loss',
                        triggerPrice: data.triggerPrice,
                        acceptablePrice: acceptablePrice,
                        sizeUsd: data.sizeDeltaUsd,
                        slippage: data.allowedSlippage / 100
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to create stop loss order"
                };
            }
        }
    }),

    // Close Position at Market (Official SDK Method)
    action({
        name: "close_position_market",
        description: "Close position immediately at market price",
        schema: z.object({
            marketAddress: z.string().describe("Market address for the position"),
            collateralTokenAddress: z.string().describe("Collateral token address"),
            isLong: z.boolean().describe("True for long position, false for short position"),
            sizeDeltaUsd: z.string().describe("Position size to close in USD (30 decimals)"),
            collateralDeltaAmount: z.string().optional().describe("Collateral amount to withdraw (optional)"),
            allowedSlippage: z.number().default(50).describe("Allowed slippage in basis points (default: 50 = 0.5%)"),
        }),
        async handler(data, ctx, agent) {
            try {
                // Get required market and token data
                const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                
                if (!marketsInfoData || !tokensData) {
                    throw new Error("Failed to get market and token data");
                }

                // Get market info
                const marketInfo = marketsInfoData[data.marketAddress];
                if (!marketInfo) {
                    throw new Error(`Market not found: ${data.marketAddress}`);
                }

                // Get collateral token info
                const collateralToken = tokensData[data.collateralTokenAddress];
                if (!collateralToken) {
                    throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                }

                // Get current market price for acceptable price calculation
                const indexToken = marketInfo.indexToken;
                const currentPrice = data.isLong 
                    ? indexToken?.prices?.minPrice || 0n  // Long: use min price for selling
                    : indexToken?.prices?.maxPrice || 0n; // Short: use max price for buying

                if (!currentPrice) {
                    throw new Error("Unable to get current market price");
                }

                // Calculate acceptable price with slippage
                const slippageAmount = (currentPrice * BigInt(data.allowedSlippage)) / 10000n;
                const acceptablePrice = data.isLong 
                    ? currentPrice - slippageAmount  // Long: can accept lower price when selling
                    : currentPrice + slippageAmount; // Short: can accept higher price when buying

                const decreaseAmounts = {
                    sizeDeltaUsd: BigInt(data.sizeDeltaUsd),
                    sizeDeltaInTokens: 0n, // Will be calculated by SDK
                    collateralDeltaAmount: data.collateralDeltaAmount ? BigInt(data.collateralDeltaAmount) : 0n,
                    triggerPrice: 0n, // No trigger for market orders
                    acceptablePrice: acceptablePrice,
                    triggerOrderType: 4, // OrderType.MarketDecrease for immediate execution
                    decreaseSwapType: 0, // No swap by default
                };

                // Create market close order using SDK
                const result = await sdk.orders.createDecreaseOrder({
                    marketInfo: marketInfo,
                    marketsInfoData: marketsInfoData,
                    tokensData: tokensData,
                    isLong: data.isLong,
                    allowedSlippage: data.allowedSlippage,
                    decreaseAmounts: decreaseAmounts,
                    collateralToken: collateralToken,
                    isTrigger: false, // Market order executes immediately
                });

                const memory = ctx.memory as GmxMemory;
                
                // Update memory with order info
                const sizeUsdFormatted = data.sizeDeltaUsd;
                memory.currentTask = "closePosition";
                memory.lastResult = `Closed ${data.isLong ? 'long' : 'short'} position at market: $${sizeUsdFormatted}`;

                return {
                    success: true,
                    message: `Successfully closed position at market price`,
                    orderDetails: {
                        marketAddress: data.marketAddress,
                        direction: data.isLong ? 'LONG' : 'SHORT',
                        orderType: 'Market Close',
                        currentPrice: currentPrice,
                        acceptablePrice: acceptablePrice,
                        sizeUsd: data.sizeDeltaUsd,
                        slippage: data.allowedSlippage / 100
                    },
                    transactionHash: result?.transactionHash || null
                };
            } catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                    message: "Failed to close position at market"
                };
            }
        }
    })
];
console.log("🚀 Starting GMX Trading Agent with Discord...");

let currentAgent: any = null;

console.log("⚡ Initializing Vega trading agent...", LogLevel.INFO);

// Create the agent with default memory
const agent = createDreams({
    model: openrouter("google/gemini-2.5-flash-preview-05-20"),
    logger: new Logger({ level: LogLevel.INFO }),
    extensions: [discord],
    context: gmxContext,
    defaultOutput: "discord:message",
    actions: gmxActions,
});

console.log("✅ Agent created successfully!");

// Start the agent
await agent.start({
    name: vegaCharacter.name,
    role: vegaCharacter.description,
});

console.log("🎯 Vega is now live and ready for GMX trading!");
