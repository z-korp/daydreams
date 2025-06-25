/**
 * GMX Trading Agent
 *
 * This file implements an AI agent that can interact with the GMX exchange to:
 * - Monitor market conditions
 * - Execute trades
 * - Manage positions
 * - Track performance
 * - Analyze trading history
 * 
 * IMPORTANT: Token approval functionality is not fully implemented yet.
 * Before trading, manually approve tokens using the GMX interface (https://app.gmx.io).
 * This grants GMX permission to use your tokens for trading.
 * Without this step, trades will fail with "insufficient allowance" errors.
 */

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
    extension
} from "@daydreamsai/core";
import { cliExtension } from "@daydreamsai/cli";
import { string, z } from "zod";
import { GmxSdk } from "@gmx-io/sdk";
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// GMX order types enum
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

// Constants
const USD_DECIMALS = 30;

// Define typed interface for GMX trading state
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


// Define the memory type for the Loot Survivor context
interface GmxTradingMemory {
    lastResult: string | null;
    gmx: GmxTradingState | null;
  }

  
// Helper function to convert BigInt to decimal with proper precision
const bigIntToDecimal = (value: bigint, decimals: number): number => {
    // Convert to string first to prevent precision loss
    const valueStr = value.toString();
    const decimalPointPosition = valueStr.length - decimals;

    if (decimalPointPosition <= 0) {
        // Value is less than 1
        return Number(`0.${'0'.repeat(Math.abs(decimalPointPosition))}${valueStr}`);
    } else {
        // Value is greater than or equal to 1
        const integerPart = valueStr.substring(0, decimalPointPosition);
        const fractionalPart = valueStr.substring(decimalPointPosition);
        return Number(`${integerPart}.${fractionalPart}`);
    }
};


// Helper function to convert trade action and order type to a readable description
function getTradeActionDescription(eventName: string, orderType: number, isLong: boolean): string {
    // TradeActionType: "OrderCreated", "OrderExecuted", "OrderCancelled", "OrderUpdated", "OrderFrozen"
    // OrderType: 0 = Market Increase, 1 = Limit Increase, 2 = Market Decrease, 3 = Limit Decrease, 4 = Market Swap, 5 = Limit Swap
    
    let action = '';
    
    switch (eventName) {
        case 'OrderCreated':
            action = 'Created';
            break;
        case 'OrderExecuted':
            action = 'Executed';
            break;
        case 'OrderCancelled':
            action = 'Cancelled';
            break;
        case 'OrderUpdated':
            action = 'Updated';
            break;
        case 'OrderFrozen':
            action = 'Frozen';
            break;
        default:
            action = eventName;
    }
    
    let orderTypeStr = '';
    switch (orderType) {
        case 0:
            orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Increase`;
            break;
        case 1:
            orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Increase`;
            break;
        case 2:
            orderTypeStr = `Market ${isLong ? 'Long' : 'Short'} Decrease`;
            break;
        case 3:
            orderTypeStr = `Limit ${isLong ? 'Long' : 'Short'} Decrease`;
            break;
        case 4:
            orderTypeStr = 'Market Swap';
            break;
        case 5:
            orderTypeStr = 'Limit Swap';
            break;
        default:
            orderTypeStr = `Order Type ${orderType}`;
    }
    
    return `${action} ${orderTypeStr}`;
}


// Log startup message
console.log("Starting GMX Trading Agent...", LogLevel.INFO);

// Validate environment variables
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
        GMX_MAX_POSITION_SIZE: z.string().default("1000"),
        GMX_MIN_POSITION_SIZE: z.string().default("10"),
        GMX_MAX_LEVERAGE: z.string().default("10"),
        GMX_SLIPPAGE_TOLERANCE: z.string().default("30"),
    })
);

// Create account from private key
const account = privateKeyToAccount(env.GMX_PRIVATE_KEY as `0x${string}`);

// Create wallet client with the account
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

// Initialize SDK with RPC URL and network
const sdk = new GmxSdk({
    rpcUrl: env.GMX_RPC_URL,
    chainId: parseInt(env.GMX_CHAIN_ID || "42161"), // Default to Arbitrum One
    oracleUrl: env.GMX_ORACLE_URL,
    walletClient: walletClient,
    subsquidUrl: env.GMX_SUBSQUID_URL,
    subgraphUrl: env.GMX_SUBSQUID_URL, // Using subsquid URL as fallback for subgraph
    account: account?.address || env.GMX_WALLET_ADDRESS as `0x${string}`, 
});

// This is redundant but keeping for safety
if (env.GMX_WALLET_ADDRESS) {
    sdk.setAccount(env.GMX_WALLET_ADDRESS as `0x${string}`);
    console.log("GMX SDK initialized with account:", env.GMX_WALLET_ADDRESS);
}

// Define GMX context template
const gmxContext = context<GmxTradingMemory>({
    type: "gmx-trading-agent",
    maxSteps: 100, // Allow many steps for continuous play
    schema: z.object({
      adventurerId: z.string().describe("The ID of the adventurer to play as"),
    }),
    instructions: `
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
- Never risk more than 10% of the portfolio on a single trade
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
render: ({ memory, args }) => {
    const adv = memory.adventurer?.adventurer;
    const stats = adv?.stats;
    const equipment = adv?.equipment;

    if (!memory.adventurer) {
      return `
Adventurer ID: ${args.adventurerId || "Not set"}
Status: No adventurer data loaded. Use getAndUpdateAdventurerState to fetch data.
`;
    }

    const level = calculateLevel(adv.xp);
    const maxHealth = 50 + adv.stats.vitality * 15 + (level - 1) * 15;
    const healthPercent = Math.round((adv.health / maxHealth) * 100);

    return `
=== ADVENTURER #${memory.adventurer.adventurerId} ===

**STATUS**
Health: ${adv.health}/${maxHealth} (${healthPercent}%)
Level: ${level} (${adv.xp} XP)
Gold: ${adv.gold}
${adv.beastHealth > 0 ? `⚔️ IN COMBAT - Beast Health: ${adv.beastHealth}` : ""}
${
  adv.statUpgradesAvailable > 0
    ? `📈 ${adv.statUpgradesAvailable} stat upgrades available!`
    : ""
}

**STATS**
STR: ${stats.strength} | DEX: ${stats.dexterity} | VIT: ${stats.vitality}
INT: ${stats.intelligence} | WIS: ${stats.wisdom} | CHA: ${
      stats.charisma
    } | LUCK: ${stats.luck}

**EQUIPMENT**
Weapon: ${formatItem(
      equipment.weapon,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Chest:  ${formatItem(
      equipment.chest,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Head:   ${formatItem(
      equipment.head,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Waist:  ${formatItem(
      equipment.waist,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Foot:   ${formatItem(
      equipment.foot,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Hand:   ${formatItem(
      equipment.hand,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Neck:   ${formatItem(
      equipment.neck,
      BigInt(memory.adventurer.adventurerEntropy)
    )}
Ring:   ${formatItem(
      equipment.ring,
      BigInt(memory.adventurer.adventurerEntropy)
    )}

**LAST ACTION**
${memory.lastResult || "No actions taken yet"}
${
  adv.statUpgradesAvailable > 0 && memory.marketItems
    ? `\n**MARKET OPEN**\nGold: ${
        adv.gold
      }\nPotion Price: ${calculatePotionPrice(
        stats.charisma
      )} gold\n\nAvailable Items:\n${memory.marketItems
        .map((id) => {
          const lootManager = new LootManager(id, 0, BigInt(0));
          const itemType = lootManager.getItemType();
          const price = calculateItemPrice(id, stats.charisma);
          return `- ${getItemName(id)} [${itemType}] - ${price}g`;
        })
        .join(
          "\n"
        )}\n\nYou can:\n- Buy potions with lootSurvivor:upgrade (heals you)\n- Buy items with lootSurvivor:upgrade\n- Upgrade stats with lootSurvivor:upgrade`
    : ""
}
`;
  },
  create: () => ({
    lastResult: null,
    adventurer: null,
    marketItems: undefined,
  }),
});

// Create the GMX extension with actions
const gmxExtension = extension({
    name: "gmx",
    contexts: {
        goal: gmxContext,
    },
    actions: [
        // READ METHODS

        // Markets
        action({
            name: "get_markets_info",
            description: "Get detailed information about markets, tokens, and trading volumes on GMX",
            schema: z.object({
            }),
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
                    const state = ctx.memory as GmxTradingState;
                    if (state) {
                        state.marketData = {
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
            schema: z.object({
            }),
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
        }),

        // Positions

        // Trades (combines Positions and Orders)
        action({
            name: "get_trades",
            description: "Get all current trading positions and orders on GMX",
            schema: z.object({}),
            async handler(data, ctx, agent) {
                try {
                    // Get market and token data first
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    
                    if (!marketsInfoData || !tokensData) {
                        throw new Error("Failed to get market and token data");
                    }
                    
                    // ===== FETCH POSITIONS =====
                    const positions = await sdk.positions.getPositions({
                        marketsData: marketsInfoData,
                        tokensData: tokensData,
                        start: 0,
                        end: 1000,
                    });
                    
                    //console.log("Raw positions data:", JSON.stringify(positions, (key, value) => 
                    //    typeof value === 'bigint' ? value.toString() : value, 2));
                    
                    // ===== FETCH ORDERS =====
                    const { ordersInfoData } = await sdk.orders.getOrders({
                        marketsInfoData,
                        tokensData
                    });
                    
                    //console.log("Raw orders data:", JSON.stringify(ordersInfoData, (key, value) => 
                    //    typeof value === 'bigint' ? value.toString() : value, 2));
                    
                    // ===== PROCESS POSITIONS =====
                    const simplifiedPositions: any[] = [];
                    
                    if (positions.positionsData) {
                        Object.values(positions.positionsData).forEach(position => {
                            try {
                                // Get market info for better display
                                const marketInfo = marketsInfoData[position.marketAddress];
                                if (!marketInfo) return;
                                
                                // Get token info
                                const indexToken = tokensData[marketInfo.indexTokenAddress];
                                const collateralToken = tokensData[position.collateralTokenAddress];
                                if (!indexToken || !collateralToken) return;
                                                                
                                // Get token decimals
                                const collateralTokenDecimals = collateralToken.decimals || 6; // Most stablecoins use 6 decimals
                                const indexTokenDecimals = indexToken.decimals || 18; // Most crypto assets use 18 decimals
                                
                                // Convert collateral amount to proper decimal value
                                const collateralAmount = bigIntToDecimal(position.collateralAmount, collateralTokenDecimals);
                                
                                // Get token prices with proper decimal conversion
                                const collateralTokenPrice = bigIntToDecimal(collateralToken.prices?.minPrice || 0n, USD_DECIMALS);
                                const indexTokenPrice = bigIntToDecimal(indexToken.prices?.maxPrice || 0n, USD_DECIMALS);
                                
                                // Calculate collateral value in USD with proper precision
                                const collateralUsd = collateralAmount * collateralTokenPrice;
                                
                                // Calculate size with proper decimal handling
                                const sizeInUsd = bigIntToDecimal(position.sizeInUsd, USD_DECIMALS);
                                
                                // Calculate index token amount (size in tokens)
                                const sizeInTokens = bigIntToDecimal(position.sizeInTokens, indexTokenDecimals);
                                
                                // Calculate entry price from size and tokens
                                const entryPrice = sizeInTokens > 0 ? sizeInUsd / sizeInTokens : 0;
                                
                                // Calculate PnL with proper precision
                                const pnlUsd = bigIntToDecimal(position.pnl || 0n, USD_DECIMALS);

                                // Calculate borrowing fees in USD with proper precision
                                const borrowingFeesUsd = bigIntToDecimal(position.pendingBorrowingFeesUsd || 0n, USD_DECIMALS);

                                // Calculate net PnL (PnL - fees)
                                const netPnl = pnlUsd - borrowingFeesUsd;

                                // Calculate net position value
                                const netPositionValue = collateralUsd + netPnl;

                                // Calculate PnL percentage based on collateral
                                const pnlPercentage = collateralUsd > 0 ? (netPnl / collateralUsd) * 100 : 0;  

                                // Calculate true leverage (size / collateral)
                                const leverage = collateralUsd > 0 ? sizeInUsd / collateralUsd : 0;

                                // Calculate liquidation price using GMX formula
                                const minCollateralFactor = leverage/10;
                                const liquidationPrice = position.isLong ?
                                    entryPrice * (1 - (1 / leverage) * (1 - minCollateralFactor)) :
                                    entryPrice * (1 + (1 / leverage) * (1 - minCollateralFactor));
                                
                                // Add the processed position with calculated values
                                simplifiedPositions.push({
                                    type: 'Position',
                                    key: position.key,
                                    marketName: marketInfo.name,
                                    indexToken: indexToken.symbol,
                                    collateralToken: collateralToken.symbol,
                                    direction: position.isLong ? 'LONG' : 'SHORT',
                                    leverage: leverage.toFixed(2) + 'x',
                                    sizeUsd: sizeInUsd.toFixed(2),
                                    collateralUsd: collateralUsd.toFixed(2),
                                    collateralAmount: collateralAmount.toFixed(6),
                                    netValue: netPositionValue.toFixed(2),
                                    pnl: netPnl.toFixed(2),
                                    pnlPercentage: pnlPercentage.toFixed(2) + '%',
                                    entryPrice: entryPrice.toFixed(2),
                                    markPrice: indexTokenPrice.toFixed(2),
                                    liquidationPrice: liquidationPrice.toFixed(2),
                                    borrowingFees: borrowingFeesUsd.toFixed(4),
                                    status: 'Open',
                                    openTime: new Date(Number(position.increasedAtTime) * 1000).toLocaleString()
                                });
                            } catch (error) {
                                console.error("Error processing position:", error);
                            }
                        });
                    }
                    
                    // ===== PROCESS ORDERS =====
                    const simplifiedOrders: any[] = [];
                    
                    if (ordersInfoData) {
                        Object.values(ordersInfoData).forEach(order => {
                            try {
                                // Common order properties
                                const baseOrderInfo = {
                                    type: 'Order',
                                    key: order.key,
                                    createdAt: order.updatedAtTime ? 
                                        new Date(Number(order.updatedAtTime) * 1000).toLocaleString() : 'Unknown',
                                };
                                
                                // Get market info if available - treating order as any to avoid type errors
                                const orderAny = order as any;
                                const marketInfo = order.marketAddress ? marketsInfoData[order.marketAddress] : (orderAny.marketInfo || null);
                                const marketName = marketInfo?.name || 'Unknown Market';
                                
                                // Determine order type more accurately by examining the structure
                                // These are the GMX OrderType values:
                                // 0=MarketSwap, 1=LimitSwap, 2=MarketIncrease, 3=LimitIncrease, 4=MarketDecrease, 5=LimitDecrease, 6=StopLossDecrease
                                
                                let orderType = order.orderType;
                                let orderTypeStr = '';
                                let orderDetails = {};
                                
                                // If order has indexToken and isLong property, it's a position order
                                const isPositionOrder = (orderAny.isLong !== undefined) && 
                                    (orderAny.indexToken || (orderAny.marketInfo?.indexToken));
                                const indexToken = orderAny.indexToken || (orderAny.marketInfo?.indexToken);
                                
                                if (isPositionOrder && indexToken) {
                                    // Position order (increase or decrease)
                                    const direction = orderAny.isLong ? 'LONG' : 'SHORT';
                                    const indexTokenSymbol = indexToken.symbol || 'Unknown';
                                    
                                    // Calculate size in USD with proper decimal conversion
                                    const sizeInUsd = order.sizeDeltaUsd ? 
                                        bigIntToDecimal(order.sizeDeltaUsd, USD_DECIMALS) : 0;
                                    
                                    // Calculate trigger price with proper decimals for limit orders
                                    let triggerPrice = null;
                                    if ('triggerPrice' in order && order.triggerPrice) {
                                        triggerPrice = bigIntToDecimal(order.triggerPrice, USD_DECIMALS).toFixed(2);
                                    } else if (orderAny.contractTriggerPrice) {
                                        // For some orders, the trigger price is in contractTriggerPrice
                                        const tokenDecimals = indexToken.decimals || 18;
                                        const priceValue = bigIntToDecimal(orderAny.contractTriggerPrice, tokenDecimals);
                                        // Convert to USD if needed (some chains store prices in token-specific decimals)
                                        triggerPrice = priceValue.toFixed(2);
                                    }
                                    
                                    // Get collateral token
                                    const collateralToken = orderAny.initialCollateralToken?.symbol || 
                                                         (order.initialCollateralTokenAddress && 
                                                          tokensData[order.initialCollateralTokenAddress]?.symbol) || 
                                                          'Unknown';
                                    
                                    // Determine action and type based on orderType
                                    let action = '';
                                    
                                    if (orderType === 2) {
                                        action = 'Market Increase';
                                        orderTypeStr = 'Market Increase';
                                    } else if (orderType === 3) {
                                        action = 'Limit Increase';
                                        orderTypeStr = 'Limit Increase';
                                    } else if (orderType === 4) {
                                        action = 'Market Decrease';
                                        orderTypeStr = 'Market Decrease';
                                    } else if (orderType === 5) {
                                        action = 'Limit Decrease';
                                        orderTypeStr = 'Limit Decrease';
                                    } else if (orderType === 6) {
                                        action = 'Stop Loss';
                                        orderTypeStr = 'Stop Loss Decrease';
                                    } else {
                                        // Default to increase order if we have position data but uncertain type
                                        if (sizeInUsd > 0 && triggerPrice) {
                                            action = 'Limit Increase';
                                            orderTypeStr = 'Limit Increase';
                                        } else {
                                            action = `Position Order Type ${orderType}`;
                                            orderTypeStr = `Position Order Type ${orderType}`;
                                        }
                                    }
                                    
                                    orderDetails = {
                                        action,
                                        orderType: orderTypeStr,
                                        market: marketName,
                                        indexToken: indexTokenSymbol,
                                        direction,
                                        size: sizeInUsd.toFixed(2),
                                        triggerPrice,
                                        collateralToken,
                                        triggerThresholdType: 'triggerThresholdType' in order ? order.triggerThresholdType : undefined
                                    };
                                } else {
                                    // Swap order
                                    let fromToken = 'Unknown';
                                    let toToken = 'Unknown';
                                    
                                    // Get from token symbol
                                    if (orderAny.initialCollateralToken) {
                                        fromToken = orderAny.initialCollateralToken.symbol;
                                    } else if (order.initialCollateralTokenAddress && tokensData[order.initialCollateralTokenAddress]) {
                                        fromToken = tokensData[order.initialCollateralTokenAddress].symbol;
                                    }
                                    
                                    // Get to token symbol
                                    if (orderAny.targetCollateralToken) {
                                        toToken = orderAny.targetCollateralToken.symbol;
                                    } else if (orderAny.marketInfo) {
                                        // Try to guess the to token from market info
                                        const market = orderAny.marketInfo;
                                        if (market.longTokenAddress && market.longTokenAddress !== order.initialCollateralTokenAddress) {
                                            toToken = tokensData[market.longTokenAddress]?.symbol || 'Unknown';
                                        } else if (market.shortTokenAddress && market.shortTokenAddress !== order.initialCollateralTokenAddress) {
                                            toToken = tokensData[market.shortTokenAddress]?.symbol || 'Unknown';
                                        }
                                    }
                                    
                                    // For swap orders
                                    const isLimit = orderType === 1;
                                    
                                    // Calculate input amount with proper decimals
                                    let amountIn = 0;
                                    let fromTokenDecimals = 18;
                                    
                                    if (order.initialCollateralTokenAddress && tokensData[order.initialCollateralTokenAddress]) {
                                        fromTokenDecimals = tokensData[order.initialCollateralTokenAddress].decimals || 18;
                                    } else if (orderAny.initialCollateralToken) {
                                        fromTokenDecimals = orderAny.initialCollateralToken.decimals || 18;
                                    }
                                    
                                    if (order.initialCollateralDeltaAmount) {
                                        amountIn = bigIntToDecimal(order.initialCollateralDeltaAmount, fromTokenDecimals);
                                    }
                                    
                                    // Check sizeDeltaUsd for swap amount in USD (some swap orders use this)
                                    let amountInUsd;
                                    if (order.sizeDeltaUsd) {
                                        amountInUsd = bigIntToDecimal(order.sizeDeltaUsd, USD_DECIMALS);
                                    }
                                    
                                    orderTypeStr = isLimit ? 'Limit Swap' : 'Market Swap';
                                    orderDetails = {
                                        action: orderTypeStr,
                                        orderType: orderTypeStr,
                                        fromToken,
                                        toToken,
                                        amountIn: amountIn.toFixed(6),
                                        amountInUsd: amountInUsd ? `$${amountInUsd.toFixed(2)}` : undefined,
                                    };
                                }
                                
                                // Add the processed order to our array
                                simplifiedOrders.push({
                                    ...baseOrderInfo,
                                    ...orderDetails
                                });
                            } catch (err) {
                                console.error("Error processing order:", err);
                                // Continue to next order
                            }
                        });
                    }
                    
                    // ===== COMBINE POSITIONS AND ORDERS =====
                    const allTrades = [...simplifiedPositions, ...simplifiedOrders];
                    
                    // Group trades by market for better organization
                    const tradesByMarket: Record<string, any[]> = {};
                    
                    allTrades.forEach(trade => {
                        const market = trade.marketName || trade.market || 'Other';
                        if (!tradesByMarket[market]) {
                            tradesByMarket[market] = [];
                        }
                        tradesByMarket[market].push(trade);
                    });
                    
                    // Update state
                    const state = ctx.memory as GmxTradingState;
                    if (state) {
                        state.positions = simplifiedPositions;
                        state.orders = simplifiedOrders;
                    }
                    
                    return {
                        success: true,
                        message: `Found ${simplifiedPositions.length} positions and ${simplifiedOrders.length} orders`,
                        summary: {
                            positionCount: simplifiedPositions.length,
                            orderCount: simplifiedOrders.length,
                            totalTradeCount: allTrades.length,
                            markets: Object.keys(tradesByMarket).length
                        },
                        positions: simplifiedPositions,
                        orders: simplifiedOrders,
                        tradesByMarket
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to fetch trades"
                    };
                }
            }
        }),
        // Trades
        action({
            name: "get_trade_history",
            description: "Get trading history on GMX",
            schema: z.object({}),
            async handler(data, ctx, agent) {
                try {
                    // Get market and token data first
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    
                    if (!marketsInfoData || !tokensData) {
                        throw new Error("Failed to get market and token data");
                    }
                                        
                    // Set default time range if not provided (last 30 days)
                    const now = Math.floor(Date.now() / 1000);
                    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
                    
                    // Create params for trade history request
                    const params: any = {
                        account: sdk.account, // Use the SDK's current account
                        pageSize: 100,
                        pageIndex: 0,
                        fromTxTimestamp: thirtyDaysAgo,
                        toTxTimestamp: now,
                        marketsInfoData,
                        tokensData
                    };
                    

                    // Fetch trade history using the SDK
                    const tradeActions = await sdk.trades.getTradeHistory(params);
                    console.log("tradeActions:", tradeActions);
                    
                    // Process trades for better readability
                    const simplifiedTrades: any[] = [];
                    let totalPnl = 0;
                    let winCount = 0;
                    let totalWins = 0;
                    let lossCount = 0;
                    let totalLosses = 0;
                    
                    tradeActions.forEach(trade => {
                        try {
                            if (!trade) return;
                            
                            // Common properties for all trade types
                            const baseTradeInfo = {
                                id: trade.id,
                                timestamp: new Date(trade.transaction.timestamp * 1000).toLocaleString(),
                                txHash: trade.transaction.hash,
                                eventName: trade.eventName,
                                orderType: trade.orderType,
                                orderKey: trade.orderKey
                            };
                            
                            // Process position trades (non-swap trades)
                            if ('marketInfo' in trade) {
                                const positionTrade = trade;
                                
                                // Extract market and token info
                                const indexToken = positionTrade.indexToken.symbol;
                                const isLong = positionTrade.isLong;
                                const side = isLong ? 'LONG' : 'SHORT';
                                
                                // Convert BigInt values to human-readable numbers
                                const sizeUsd = bigIntToDecimal(positionTrade.sizeDeltaUsd, USD_DECIMALS);
                                
                                // Get prices with proper decimal handling
                                const price = positionTrade.executionPrice 
                                    ? bigIntToDecimal(positionTrade.executionPrice, USD_DECIMALS)
                                    : positionTrade.triggerPrice
                                        ? bigIntToDecimal(positionTrade.triggerPrice, USD_DECIMALS)
                                        : 0;
                                
                                // Calculate PnL if available
                                let pnlUsd = 0;
                                let pnlPercentage = 0;
                                
                                if (positionTrade.pnlUsd) {
                                    pnlUsd = bigIntToDecimal(positionTrade.pnlUsd, USD_DECIMALS);
                                    
                                    // Update statistics
                                    totalPnl += pnlUsd;
                                    
                                    if (pnlUsd > 0) {
                                        winCount++;
                                        totalWins += pnlUsd;
                                    } else if (pnlUsd < 0) {
                                        lossCount++;
                                        totalLosses += Math.abs(pnlUsd);
                                    }
                                }
                                
                                // Get fees if available
                                const fees = {
                                    positionFee: positionTrade.positionFeeAmount 
                                        ? bigIntToDecimal(positionTrade.positionFeeAmount, USD_DECIMALS) 
                                        : 0,
                                    borrowingFee: positionTrade.borrowingFeeAmount 
                                        ? bigIntToDecimal(positionTrade.borrowingFeeAmount, USD_DECIMALS) 
                                        : 0,
                                    fundingFee: positionTrade.fundingFeeAmount 
                                        ? bigIntToDecimal(positionTrade.fundingFeeAmount, USD_DECIMALS) 
                                        : 0
                                };
                                
                                // Add to simplified trades array
                                simplifiedTrades.push({
                                    ...baseTradeInfo,
                                    type: 'Position',
                                    market: positionTrade.marketInfo.name,
                                    marketAddress: positionTrade.marketAddress,
                                    indexToken,
                                    side,
                                    size: sizeUsd.toFixed(2),
                                    price: price.toFixed(2),
                                    collateral: {
                                        token: positionTrade.initialCollateralToken.symbol,
                                        amount: bigIntToDecimal(
                                            positionTrade.initialCollateralDeltaAmount, 
                                            positionTrade.initialCollateralToken.decimals
                                        ).toFixed(6)
                                    },
                                    pnl: pnlUsd.toFixed(2),
                                    pnlPercentage: pnlPercentage.toFixed(2) + '%',
                                    fees,
                                    // Add action type based on eventName and orderType
                                    action: getTradeActionDescription(trade.eventName, trade.orderType, isLong)
                                });
                            } 
                            // Process swap trades
                            else if ('targetCollateralToken' in trade) {
                                const swapTrade = trade;
                                
                                // Convert BigInt values to human-readable numbers
                                const fromToken = swapTrade.initialCollateralToken;
                                const toToken = swapTrade.targetCollateralToken;
                                
                                const amountIn = bigIntToDecimal(
                                    swapTrade.initialCollateralDeltaAmount, 
                                    fromToken.decimals
                                );
                                
                                const amountOut = swapTrade.executionAmountOut 
                                    ? bigIntToDecimal(swapTrade.executionAmountOut, toToken.decimals)
                                    : 0;
                                
                                // Add to simplified trades array
                                simplifiedTrades.push({
                                    ...baseTradeInfo,
                                    type: 'Swap',
                                    fromToken: fromToken.symbol,
                                    toToken: toToken.symbol,
                                    amountIn: amountIn.toFixed(6),
                                    amountOut: amountOut.toFixed(6),
                                    // Add action type based on eventName and orderType
                                    action: getTradeActionDescription(trade.eventName, trade.orderType, false)
                                });
                            }
                        } catch (err) {
                            console.error("Error processing trade:", err);
                            // Continue to next trade
                        }
                    });
                    
                    // Calculate performance metrics
                    const tradeCount = simplifiedTrades.length;
                    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
                    const averageProfit = winCount > 0 ? totalWins / winCount : 0;
                    const averageLoss = lossCount > 0 ? totalLosses / lossCount : 0;
                    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
                    
                    // Update state
                    const state = ctx.memory as GmxTradingState;
                    if (state) {
                        state.tradingHistory = {
                            trades: simplifiedTrades,
                            performance: {
                                totalPnl,
                                winRate,
                                averageProfit,
                                averageLoss
                            }
                        };
                    }
                    
                    return {
                        success: true,
                        message: `Retrieved ${simplifiedTrades.length} trades from ${new Date(thirtyDaysAgo * 1000).toLocaleDateString()} to ${new Date(now * 1000).toLocaleDateString()}`,
                        trades: simplifiedTrades,
                        performance: {
                            totalPnl: totalPnl.toFixed(2),
                            winRate: winRate.toFixed(2) + '%',
                            averageProfit: averageProfit.toFixed(2),
                            averageLoss: averageLoss.toFixed(2),
                            profitFactor: profitFactor.toFixed(2),
                            tradeCount,
                            winCount,
                            lossCount,
                            tradingPeriod: {
                                from: new Date(thirtyDaysAgo * 1000).toLocaleDateString(),
                                to: new Date(now * 1000).toLocaleDateString()
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


        // WRITE METHODS

        // Orders
        action({
            name: "cancel_orders",
            description: "Cancel orders on GMX by order keys",
            schema: z.object({
                orderKeys: z.array(z.string()).describe("Array of order keys to cancel"),
            }),
            async handler(data, ctx, agent) {
                try {                    
                    // Cancel orders
                    const result = await sdk.orders.cancelOrders(data.orderKeys);
                    
                    return {
                        success: true,
                        message: `Successfully submitted cancellation for ${data.orderKeys.length} orders`,
                        result
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

        /* Token approval
        action({
            name: "approve_token",
            description: "Approve token for spending by GMX exchange router",
            schema: z.object({
                tokenAddress: z.string().describe("Address of the token to approve"),
                amount: z.string().describe("Amount to approve (use 'max' for maximum approval)"),
            }),
            async handler(
                call: ActionCall<{
                  tokenAddress: string;
                  amount: string;
                }>,
                ctx: any,
                agent: Agent
              ) {
                try {                    
                    // Set the exchange router address based on the chain
                    // This is the contract that needs token approval
                    const exchangeRouterAddress = "0x7452c558d45f8afc8c83dae62c3f8a5be19c71f6"; // GMX ExchangeRouter on Arbitrum

                    // Convert amount to BigInt
                    let approvalAmount: bigint;
                    if (data.amount.toLowerCase() === 'max') {
                        // Instead of maximum possible approval amount, use a high but limited value
                        // Get token info to calculate decimals
                        const tokensDataResult = await sdk.tokens.getTokensData();
                        const tokensData = tokensDataResult.tokensData || {};
                        const tokenInfo = tokensData[data.tokenAddress];
                        
                        if (!tokenInfo) {
                            throw new Error(`Token not found: ${data.tokenAddress}`);
                        }
                        
                        // Set approval to equivalent of 100,000 tokens (which should be plenty for trading)
                        const decimalMultiplier = 10n ** BigInt(tokenInfo.decimals || 18);
                        approvalAmount = 100000n * decimalMultiplier;
                    } else {
                        // Get token info to calculate decimals
                        const tokensDataResult = await sdk.tokens.getTokensData();
                        const tokensData = tokensDataResult.tokensData || {};
                        const tokenInfo = tokensData[data.tokenAddress];
                        
                        if (!tokenInfo) {
                            throw new Error(`Token not found: ${data.tokenAddress}`);
                        }
                        
                        // Parse amount with token's decimals and multiply by 10 for buffer
                        const decimalMultiplier = 10n ** BigInt(tokenInfo.decimals || 18);
                        const baseAmount = BigInt(Math.floor(parseFloat(data.amount) * Number(decimalMultiplier)));
                        approvalAmount = baseAmount * 10n; // 10x the requested amount
                    }
                    
                    console.log(`Approving ${data.tokenAddress} for ${approvalAmount} to spender ${exchangeRouterAddress}`);
                    
                    // Create and send approval transaction
                    const result = await sdk.callContract(
                        data.tokenAddress as `0x${string}`,
                        tokenAbi,
                        "approve",
                        [exchangeRouterAddress as `0x${string}`, approvalAmount]
                    );
                    
                    return {
                        success: true,
                        message: `Successfully submitted approval for ${data.amount} of token ${data.tokenAddress}`,
                        tokenAddress: data.tokenAddress,
                        spender: exchangeRouterAddress,
                        amount: data.amount,
                        txHash: result
                    };
                } catch (error) {
                    console.error("Error approving token:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to approve token"
                    };
                }
            }
        }),
        */

        action({
            name: "create_increase_order",
            description: "Create a new increase position order on GMX",
            schema: z.object({
                marketAddress: z.string().describe("Address of the market to trade - ALWAYS USE marketTokenAddress"),
                collateralTokenAddress: z.string().describe("Address of the token to use as collateral"),
                indexTokenAddress: z.string().describe("Address of the token to use as index"),
                isLong: z.boolean().describe("Whether the position is long or short"),
                isLimit: z.boolean().describe("Whether this is a limit order"),
                sizeUsd: z.number().describe("Size of the position in USD"),
                leverage: z.number().describe("Leverage for the position"),
                triggerPrice: z.string().optional().describe("Price at which to trigger a limit order"),
            }),
            async handler(data, ctx, agent) {
                try {
                    // Get market and token data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();

                    console.log("data", data);
                    if (!marketsInfoData || !tokensData) {
                        throw new Error("Failed to get market and token data");
                    }
                    
                    // Get market info
                    const marketInfo = marketsInfoData[data.marketAddress];
                    if (!marketInfo) {
                        throw new Error(`Market not found: ${data.marketAddress}`);
                    }
                    
                    // Get collateral token
                    const collateralToken = tokensData[data.collateralTokenAddress];
                    if (!collateralToken) {
                        throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                    }
                    
                    // Get index token
                    const indexToken = tokensData[marketInfo.indexTokenAddress];
                    if (!indexToken) {
                        throw new Error(`Index token not found for market: ${data.marketAddress}`);
                    }
                    
                    // Calculate a reasonable position sizes with proper precision
                    // GMX uses 30 decimals for USD amounts
                    const sizeDeltaUsd = BigInt(Math.floor(data.sizeUsd * (10 ** USD_DECIMALS)));
                    const collateralUsd = sizeDeltaUsd / BigInt(data.leverage);
                    
                    // Get prices for tokens - these come from the SDK data
                    const indexTokenPrice = indexToken.prices?.maxPrice || 0n;
                    const collateralTokenPrice = collateralToken.prices?.minPrice || 0n;
                    
                    // Calculate collateral amount from USD value
                    const collateralAmount = collateralUsd * BigInt(10 ** collateralToken.decimals) / collateralTokenPrice;
                    
                    // Calculate token amount from USD value
                    const sizeDeltaInTokens = sizeDeltaUsd * BigInt(10 ** indexToken.decimals) / indexTokenPrice;
                    
                    // Calculate acceptable price with small slippage
                    const acceptablePriceDeltaBps = BigInt(parseInt(env.GMX_SLIPPAGE_TOLERANCE));
                    const isLong = data.isLong;
                    
                    // For long positions, we're willing to pay more, for shorts we want to receive more
                    const acceptablePriceMultiplier = isLong 
                        ? 10000n + acceptablePriceDeltaBps 
                        : 10000n - acceptablePriceDeltaBps;
                    
                    const acceptablePrice = (indexTokenPrice * acceptablePriceMultiplier) / 10000n;
                    
                    // Calculate position fees
                    // This is typically around 0.1% of position size
                    const positionFeeUsd = sizeDeltaUsd / BigInt(1000);
                    
                    // Parse trigger price if provided
                    let triggerPrice = 0n;
                    if (data.triggerPrice) {
                        triggerPrice = BigInt(parseFloat(data.triggerPrice) * (10 ** USD_DECIMALS));
                    }
                    
                    // Create a properly formatted increaseAmounts object
                    const increaseAmounts = {
                        initialCollateralAmount: collateralAmount,
                        initialCollateralUsd: collateralUsd,
                        collateralDeltaAmount: collateralAmount,
                        collateralDeltaUsd: collateralUsd,
                        indexTokenAmount: sizeDeltaInTokens,  // Amount in tokens based on price
                        sizeDeltaUsd: sizeDeltaUsd,
                        sizeDeltaInTokens: sizeDeltaInTokens,
                        estimatedLeverage: BigInt(Math.floor(data.leverage * 10000)),
                        indexPrice: indexTokenPrice,
                        initialCollateralPrice: collateralTokenPrice,
                        collateralPrice: collateralTokenPrice,
                        triggerPrice: triggerPrice,
                        acceptablePrice: acceptablePrice,
                        acceptablePriceDeltaBps: acceptablePriceDeltaBps,
                        positionFeeUsd: positionFeeUsd,
                        swapPathStats: undefined,
                        uiFeeUsd: 0n,
                        swapUiFeeUsd: 0n,
                        feeDiscountUsd: 0n,
                        borrowingFeeUsd: 0n,
                        fundingFeeUsd: 0n,
                        positionPriceImpactDeltaUsd: 0n,
                        
                        // Include these additional properties required by the SDK
                        estimatedPnl: 0n,
                        estimatedPnlPercentage: 0n,
                        entryMarkPrice: indexTokenPrice,
                        exitMarkPrice: indexTokenPrice,
                        sizeDeltaInTokensUsd: sizeDeltaUsd,
                        collateralDeltaInTokensUsd: collateralUsd,
                        executionPrice: indexTokenPrice,
                        entryPrice: indexTokenPrice,
                        markPrice: indexTokenPrice,
                        liquidationPrice: 0n,
                        minCollateralUsd: collateralUsd,
                        priceImpactDiffUsd: 0n
                    };

                    console.log("Submitting increase order with amounts:", JSON.stringify({
                        marketAddress: data.marketAddress,
                        isLong: data.isLong,
                        isLimit: data.isLimit,
                        leverage: data.leverage,
                        sizeUsd: data.sizeUsd,
                        initialCollateralUsd: Number(collateralUsd) / (10 ** USD_DECIMALS),
                    }));
                    
                    // Create increase order
                    const result = await sdk.orders.createIncreaseOrder({
                        marketsInfoData,
                        tokensData,
                        isLimit: data.isLimit,
                        isLong: data.isLong,
                        marketAddress: data.marketAddress,
                        allowedSlippage: parseInt(env.GMX_SLIPPAGE_TOLERANCE),
                        collateralToken,
                        collateralTokenAddress: collateralToken.address,
                        receiveTokenAddress: collateralToken.address,
                        fromToken: collateralToken,
                        marketInfo,
                        indexToken,
                        increaseAmounts,
                        skipSimulation: true, // Set to true to avoid simulation errors
                    });

                    return {
                        success: true,
                        message: "Successfully created increase order",
                        result,
                        orderDetails: {
                            market: data.marketAddress,
                            marketName: marketInfo.name,
                            isLong: data.isLong,
                            isLimit: data.isLimit,
                            sizeUsd: data.sizeUsd,
                            leverage: data.leverage,
                            collateralToken: collateralToken.symbol,
                        }
                    };
                } catch (error) {
                    console.error("Error creating increase order:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to create increase order"
                    };
                }
            }
        }),

        action({
            name: "create_decrease_order",
            description: "Create a new decrease position order on GMX",
            schema: z.object({
                marketAddress: z.string().describe("Address of the market to trade - ALWAYS USE marketTokenAddress"),
                collateralTokenAddress: z.string().describe("Address of the token to use as collateral"),
                indexTokenAddress: z.string().describe("Address of the token to use as index"),
                isLong: z.boolean().describe("Whether the position is long or short"),
                isLimit: z.boolean().describe("Whether this is a limit order or market order"),
                sizeUsd: z.number().describe("Size of the position to decrease in USD"),
                triggerPrice: z.string().optional().describe("Price at which to trigger a limit order"),
            }),
            async handler(data, ctx, agent) {
                try {
                    // Get market and token data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    
                    if (!marketsInfoData || !tokensData) {
                        throw new Error("Failed to get market and token data");
                    }
                    
                    // Get market info
                    const marketInfo = marketsInfoData[data.marketAddress];
                    if (!marketInfo) {
                        throw new Error(`Market not found: ${data.marketAddress}`);
                    }
                    
                    // Get collateral token
                    const collateralToken = tokensData[data.collateralTokenAddress];
                    if (!collateralToken) {
                        throw new Error(`Collateral token not found: ${data.collateralTokenAddress}`);
                    }
                    
                    // Get index token
                    const indexToken = tokensData[marketInfo.indexTokenAddress];
                    if (!indexToken) {
                        throw new Error(`Index token not found for market: ${data.marketAddress}`);
                    }
                    
                    // Set up size delta in USD with proper precision
                    const sizeDeltaUsd = BigInt(Math.floor(data.sizeUsd * (10 ** USD_DECIMALS)));
                    
                    // Calculate token amount from USD value
                    const indexTokenPrice = indexToken.prices?.maxPrice || 0n;
                    const sizeDeltaInTokens = indexTokenPrice > 0 ? 
                        (sizeDeltaUsd * BigInt(10 ** indexToken.decimals)) / indexTokenPrice : 
                        0n;
                    
                    // Calculate acceptable price with slippage
                    const acceptablePriceDeltaBps = BigInt(parseInt(env.GMX_SLIPPAGE_TOLERANCE));
                    
                    // For long positions on decrease, we want to receive MORE, for shorts we accept LESS
                    const acceptablePriceMultiplier = data.isLong 
                        ? 10000n - acceptablePriceDeltaBps 
                        : 10000n + acceptablePriceDeltaBps;
                    
                    const acceptablePrice = (indexTokenPrice * acceptablePriceMultiplier) / 10000n;
                    
                    // Parse trigger price if provided for limit orders
                    let triggerPrice = 0n;
                    if (data.triggerPrice) {
                        triggerPrice = BigInt(parseFloat(data.triggerPrice) * (10 ** USD_DECIMALS));
                    }
                    
                    // Create decrease position amounts object
                    const decreaseAmounts: any = {
                        isFullClose: false, // Partial close based on sizeDeltaUsd
                        sizeDeltaUsd,
                        sizeDeltaInTokens,
                        collateralDeltaUsd: sizeDeltaUsd, // Assumes 1:1 withdrawal of collateral proportional to size
                        collateralDeltaAmount: 0n, // Will be calculated by GMX

                        indexPrice: indexTokenPrice,
                        collateralPrice: collateralToken.prices?.minPrice || 0n,
                        triggerPrice: data.isLimit ? triggerPrice : undefined,
                        acceptablePrice,
                        acceptablePriceDeltaBps,
                        recommendedAcceptablePriceDeltaBps: acceptablePriceDeltaBps,

                        // Required fields with default values
                        estimatedPnl: 0n,
                        estimatedPnlPercentage: 0n,
                        realizedPnl: 0n,
                        realizedPnlPercentage: 0n,
                        
                        positionFeeUsd: 0n,
                        uiFeeUsd: 0n,
                        swapUiFeeUsd: 0n,
                        feeDiscountUsd: 0n,
                        borrowingFeeUsd: 0n,
                        fundingFeeUsd: 0n,
                        swapProfitFeeUsd: 0n,
                        positionPriceImpactDeltaUsd: 0n,
                        priceImpactDiffUsd: 0n,
                        payedRemainingCollateralAmount: 0n,
                        
                        payedOutputUsd: 0n,
                        payedRemainingCollateralUsd: 0n,
                        
                        receiveTokenAmount: 0n,
                        receiveUsd: 0n,
                        
                        // Set the order type based on isLimit
                        triggerOrderType: data.isLimit ? 
                            OrderType.LimitDecrease : 
                            OrderType.MarketDecrease,
                        
                        // Use NoSwap as the default swap type (receive same token as collateral)
                        decreaseSwapType: 0, // DecreasePositionSwapType.NoSwap
                    };
                    
                    console.log("Submitting decrease order with amounts:", JSON.stringify({
                        marketAddress: data.marketAddress,
                        isLong: data.isLong,
                        isLimit: data.isLimit,
                        sizeUsd: data.sizeUsd,
                    }));
                    
                    // Create decrease order
                    const result = await sdk.orders.createDecreaseOrder({
                        marketsInfoData,
                        tokensData,
                        marketInfo,
                        decreaseAmounts,
                        collateralToken,
                        allowedSlippage: parseInt(env.GMX_SLIPPAGE_TOLERANCE),
                        isLong: data.isLong,
                        referralCode: undefined, // Optional referral code
                    });
                    
                    return {
                        success: true,
                        message: "Successfully created decrease order",
                        result,
                        orderDetails: {
                            market: data.marketAddress,
                            marketName: marketInfo.name,
                            isLong: data.isLong,
                            isLimit: data.isLimit,
                            sizeUsd: data.sizeUsd,
                            collateralToken: collateralToken.symbol,
                        }
                    };
                } catch (error) {
                    console.error("Error creating decrease order:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to create decrease order"
                    };
                }
            }
        }),

        action({
            name: "create_swap_order",
            description: "Create a token swap order on GMX",
            schema: z.object({
                fromTokenAddress: z.string().describe("Address of the token to swap from"),
                toTokenAddress: z.string().describe("Address of the token to swap to"),
                amountIn: z.number().describe("Amount of fromToken to swap"),
                isLimit: z.boolean().describe("Whether this is a limit order"),
            }),
            async handler(data, ctx, agent) {
                try {
                    // Get market and token data
                    const { marketsInfoData, tokensData } = await sdk.markets.getMarketsInfo();
                    
                    if (!marketsInfoData || !tokensData) {
                        throw new Error("Failed to get market and token data");
                    }
                                        
                    // Get tokens
                    const fromToken = tokensData[data.fromTokenAddress];
                    if (!fromToken) {
                        throw new Error(`From token not found: ${data.fromTokenAddress}`);
                    }
                    
                    const toToken = tokensData[data.toTokenAddress];
                    if (!toToken) {
                        throw new Error(`To token not found: ${data.toTokenAddress}`);
                    }
                    
                    // Find a market that contains both tokens
                    let swapPath: string[] = [];
                    let marketKey: string | null = null;
                    
                    // First try to find a direct market
                    for (const [address, market] of Object.entries(marketsInfoData)) {
                        // Check if market contains both tokens
                        const hasFromToken = 
                            market.longTokenAddress === data.fromTokenAddress || 
                            market.shortTokenAddress === data.fromTokenAddress;
                        
                        const hasToToken = 
                            market.longTokenAddress === data.toTokenAddress || 
                            market.shortTokenAddress === data.toTokenAddress;
                        
                        if (hasFromToken && hasToToken) {
                            marketKey = address;
                            swapPath = [address];
                            break;
                        }
                    }
                    
                    // If no direct market found, find an intermediary through USDC
                    if (!marketKey) {
                        const usdcAddress = "0xaf88d065e77c8cc2239327c5edb3a432268e5831"; // USDC on Arbitrum
                        let fromTokenMarket: string | null = null;
                        let toTokenMarket: string | null = null;
                        
                        for (const [address, market] of Object.entries(marketsInfoData)) {
                            // Find market for fromToken to USDC
                            if (!fromTokenMarket && 
                                (market.longTokenAddress === data.fromTokenAddress || market.shortTokenAddress === data.fromTokenAddress) &&
                                (market.longTokenAddress === usdcAddress || market.shortTokenAddress === usdcAddress)) {
                                fromTokenMarket = address;
                            }
                            
                            // Find market for USDC to toToken
                            if (!toTokenMarket && 
                                (market.longTokenAddress === data.toTokenAddress || market.shortTokenAddress === data.toTokenAddress) &&
                                (market.longTokenAddress === usdcAddress || market.shortTokenAddress === usdcAddress)) {
                                toTokenMarket = address;
                            }
                            
                            if (fromTokenMarket && toTokenMarket) {
                                swapPath = [fromTokenMarket, toTokenMarket];
                                break;
                            }
                        }
                    }
                    
                    if (swapPath.length === 0) {
                        throw new Error(`Could not find a valid swap path from ${fromToken.symbol} to ${toToken.symbol}`);
                    }
                    
                    // Calculate input amount with proper precision
                    const amountIn = BigInt(Math.floor(data.amountIn * Number(`1e${fromToken.decimals || 18}`)));
                    
                    // Get token prices
                    const fromTokenPrice = fromToken.prices?.minPrice || 0n;
                    const toTokenPrice = toToken.prices?.maxPrice || 0n;
                    
                    // Calculate USD values
                    const usdIn = amountIn * fromTokenPrice / BigInt(10 ** (fromToken.decimals || 18));
                    
                    // Calculate estimated output amount with 0.3% fee
                    const feeAmount = usdIn * 30n / 10000n; // 0.3% fee
                    const usdAfterFee = usdIn - feeAmount;
                    
                    const estimatedAmountOut = toTokenPrice > 0 ? 
                        (usdAfterFee * BigInt(10 ** (toToken.decimals || 18))) / toTokenPrice : 
                        0n;
                    
                    // Apply slippage to minimum output
                    const slippageBps = BigInt(parseInt(env.GMX_SLIPPAGE_TOLERANCE));
                    const minOutputAmount = (estimatedAmountOut * (10000n - slippageBps)) / 10000n;
                    
                    // Calculate USD out with slippage
                    const usdOut = minOutputAmount * toTokenPrice / BigInt(10 ** (toToken.decimals || 18));
                    
                    // Create swap path stats 
                    const swapPathStats = {
                        swapPath,
                        swapSteps: [{
                            marketAddress: swapPath[0],
                            tokenInAddress: data.fromTokenAddress,
                            tokenOutAddress: data.toTokenAddress,
                            isWrap: false,
                            isUnwrap: false,
                            swapFeeAmount: feeAmount,
                            swapFeeUsd: feeAmount,
                            priceImpactDeltaUsd: 0n,
                            amountIn,
                            amountInAfterFees: amountIn - (amountIn * 30n / 10000n),
                            usdIn,
                            amountOut: estimatedAmountOut,
                            usdOut
                        }],
                        totalSwapPriceImpactDeltaUsd: 0n,
                        totalSwapFeeUsd: feeAmount,
                        totalFeesDeltaUsd: feeAmount,
                        tokenInAddress: data.fromTokenAddress,
                        tokenOutAddress: data.toTokenAddress,
                        usdOut,
                        amountOut: estimatedAmountOut
                    };
                    
                    // Create complete SwapAmounts object
                    const swapAmounts = {
                        amountIn,
                        usdIn,
                        amountOut: estimatedAmountOut,
                        usdOut,
                        priceIn: fromTokenPrice,
                        priceOut: toTokenPrice,
                        swapPathStats,
                        minOutputAmount,
                        uiFeeUsd: 0n
                    };
                    
                    console.log("Submitting swap order with parameters:", JSON.stringify({
                        fromToken: fromToken.symbol,
                        toToken: toToken.symbol,
                        amountIn: data.amountIn,
                        isLimit: data.isLimit,
                        estimatedAmountOut: Number(estimatedAmountOut) / (10 ** (toToken.decimals || 18)),
                        swapPath: swapPath.map(p => marketsInfoData[p]?.name || p),
                    }));
                    
                    // Create swap order
                    const result = await sdk.orders.createSwapOrder({
                        isLimit: data.isLimit,
                        allowedSlippage: parseInt(env.GMX_SLIPPAGE_TOLERANCE),
                        swapAmounts,
                        fromToken,
                        toToken,
                        tokensData
                    });
                    
                    return {
                        success: true,
                        message: "Successfully created swap order",
                        result,
                        swapDetails: {
                            fromToken: fromToken.symbol,
                            toToken: toToken.symbol,
                            amountIn: data.amountIn,
                            estimatedAmountOut: Number(estimatedAmountOut) / (10 ** (toToken.decimals || 18)),
                            isLimit: data.isLimit,
                            minOutputAmount: Number(minOutputAmount) / (10 ** (toToken.decimals || 18)),
                            swapPath: swapPath.map(p => marketsInfoData[p]?.name || p),
                        }
                    };
                } catch (error) {
                    console.error("Error creating swap order:", error);
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : String(error),
                        message: "Failed to create swap order"
                    };
                }
            }
        }),
    ],
});

// 4. Create the GMX agent
const agent = createDreams({
    model: openrouter("google/gemini-2.0-flash-001"),
    logger: new Logger({ level: LogLevel.DEBUG }),
    extensions: [cliExtension, gmxExtension],
    contexts: [gmxContext],
});

// 5. Start the agent with initial goals
console.log("Starting agent with initial goals...", LogLevel.INFO);

(async () => {
    await agent.start();
})();

// Handle exit
process.on("SIGINT", () => {
    console.log("Shutting down agent...");
    process.exit(0);
  });
