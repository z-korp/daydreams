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
    extension,
    validateEnv, 
    LogLevel,
    Logger
} from "@daydreamsai/core";
import { discord } from "@daydreamsai/discord";
import { createMongoMemoryStore } from "@daydreamsai/mongodb";
import { z } from "zod/v4";
import { GmxSdk } from "@gmx-io/sdk";
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createGmxActions } from './gmx-actions';
import type { GmxMemory } from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// ⚙️ ENVIRONMENT VALIDATION & SETUP
// ═══════════════════════════════════════════════════════════════════════════════

console.log("🚀 Starting GMX Trading Agent...");

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
        DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required for Discord output"),
        DISCORD_BOT_NAME: z.string().min(1, "DISCORD_BOT_NAME is required for Discord output"),
        MONGODB_STRING: z.string().min(1, "MONGODB_STRING is required for persistent memory"),
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

## AUTOMATED TRADING PROTOCOLS:
🔄 MARKET REFRESH (Every 10min):
- Always call get_markets_info first to update market data
- Update get_daily_volumes for liquidity check  
- Refresh get_latest_predictions for AI signals from Synth
- Store key metrics in memory for decision making

⚖️ POSITION MONITORING (Every 15min):
- Call get_positions to analyze all positions with PnL calculations
- Remove outdated orders with cancel_orders

🎯 OPPORTUNITY SCANNING (Every 20min):
- Check get_synth_leaderboard for top-performing AI miners
- Get get_latest_predictions for BTC/ETH signals with confidence scores
- Compare AI predictions with current get_markets_info prices

💹 TRADE EXECUTION (Every 30min):
- Review get_orders for execution status and performance
- Execute trades opportunities with open_long_position/open_short_position
- Adjust existing positions based on new market data
- Update performance tracking with get_trade_history

## RISK MANAGEMENT RULES:
- Always query your current balance before executing trades
- Never risk more than 5% of portfolio per trade
- Always set stop losses and take profits within 24 hours of opening position
- Use AI predictions as primary signal source

## CRITICAL INSTRUCTIONS:
- You can not execute transactions in parallel, you must wait for the previous transaction to be executed before executing the next one
- ALWAYS provide a clear summary of your analysis and actions at the end of your response
- Your final message will be sent to Discord, so make it informative and engaging

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
}).setInputs({
    "gmx:market-refresh": input({
        subscribe(send, { container }) {
            console.log("🔄 Market refresh input ACTIVATED - starting 10-minute intervals");
            console.log("📋 Send function:", typeof send);
            console.log("🏗️ Container available:", !!container);
            
            const interval = setInterval(async () => {
                console.log("⏰ Market refresh interval triggered - sending to Vega");
                try {
                    await send(gmxContext, 
                        { name: "vega", role: "market-analyst" }, 
                        "🔄 Time for market refresh - check latest market conditions, volumes, and AI predictions. Then provide a complete market analysis summary for Discord."
                    );
                    console.log("✅ Send completed successfully");
                } catch (error) {
                    console.error("❌ Send failed:", error);
                }
            }, 900000); // 15 minutes

            console.log("✅ Market refresh subscription setup complete");
            return () => {
                console.log("🛑 Market refresh subscription cleanup");
                clearInterval(interval);
            };
        }
    }),

    "gmx:position-monitor": input({
        subscribe(send, { container }) {
            console.log("⚖️ Position monitor input ACTIVATED - starting 15-minute intervals");
            const interval = setInterval(async () => {
                try {
                    console.log("⏰ Position monitor interval triggered - sending to Vega");

                    send(gmxContext,
                        { name: "vega", role: "risk-manager" },
                        "⚖️ Position monitoring time - analyze all current positions for risk levels, PnL, liquidation distances, and implement any needed protective measures"
                    );
                } catch (error) {
                    console.error("Position monitoring failed:", error);
                }
            }, 1200000); // 20 minutes

            return () => clearInterval(interval);
        }
    }),

    "gmx:opportunity-scanner": input({
        subscribe(send, { container }) {
            console.log("🎯 Opportunity scanner input ACTIVATED - starting 20-minute intervals");
            const interval = setInterval(async () => {
                try {
                    console.log("⏰ Opportunity scanner interval triggered - sending to Vega");

                    send(gmxContext,
                        { name: "vega", role: "opportunity-hunter" },
                        "🎯 Opportunity scan - check Synth AI predictions, analyze market conditions, and identify high-confidence trading opportunities"
                    );
                } catch (error) {
                    console.error("Opportunity scanning failed:", error);
                }
            }, 1500000); // 25 minutes

            return () => clearInterval(interval);
        }
    }),

    "gmx:trade-executor": input({
        subscribe(send, { container }) {
            console.log("💹 Trade executor input ACTIVATED - starting 30-minute intervals");
            const interval = setInterval(async () => {
                try {
                    console.log("⏰ Trade executor interval triggered - sending to Vega");

                    send(gmxContext,
                        { name: "vega", role: "trade-executor" },
                        "💹 Trade execution phase - review market analysis, execute approved high-confidence trades, and adjust existing positions with proper risk management"
                    );
                } catch (error) {
                    console.error("Trade execution failed:", error);
                }
            }, 2100000); // 35 minutes

            return () => clearInterval(interval);
        }
    })
});

// Create GMX actions using the SDK instance
const gmxActions = createGmxActions(sdk, env);

// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 GMX EXTENSION DEFINITION
// ═══════════════════════════════════════════════════════════════════════════════

const gmx = extension({
    name: "gmx",
    contexts: {
        gmxTrading: gmxContext,
    },
});

console.log("⚡ Initializing Vega trading agent...");

// Initialize persistent memory stores
console.log("🗄️ Setting up MongoDB persistent memory...");
const mongoMemoryStore = await createMongoMemoryStore({
    uri: env.MONGODB_STRING,
    dbName: "vega_trading_agent", 
    collectionName: "gmx_memory"
});

console.log("✅ Memory stores initialized!");

// Create the agent with persistent memory
const agent = createDreams({
    model: openrouter("google/gemini-2.5-flash-preview-05-20"),
    logger: new Logger({ level: LogLevel.DEBUG }), // Enable debug logging
    extensions: [discord, gmx], // Add GMX extension
    context: gmx.contexts!.gmxTrading, // Use context from extension
    defaultOutput: "discord:message",
    actions: gmxActions,
    memory: {
        store: mongoMemoryStore
    },
});

console.log("✅ Agent created successfully!");

// Start the agent with GMX context arguments
await agent.start({
    name: vegaCharacter.name,
    role: vegaCharacter.description,
});

console.log("🎯 Vega is now live and ready for GMX trading!");
console.log("📡 Discord Channel ID:", env.DISCORD_CHANNEL_ID);
console.log("🤖 Discord Bot Name:", env.DISCORD_BOT_NAME);
