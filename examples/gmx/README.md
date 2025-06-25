# 🌟 VEGA - Autonomous GMX Portfolio Manager

An advanced AI trading agent specializing in GMX perpetual futures with autonomous decision-making, real-time risk management, and comprehensive market analysis. Built with the Daydreams AI framework.

## ✨ Overview

Vega is a sophisticated autonomous trading agent that operates as a portfolio manager on the GMX decentralized exchange. Unlike basic trading bots, Vega makes independent trading decisions based on market analysis, risk assessment, and performance optimization.

### 🎯 Core Capabilities

- **🤖 Autonomous Trading**: Makes independent buy/sell decisions without requiring approval
- **📊 Advanced Analytics**: Comprehensive PnL, liquidation price, and risk metric calculations
- **⚡ Real-time Execution**: Instant order placement and position management
- **🛡️ Dynamic Risk Management**: Adaptive position sizing and automatic stop-loss/take-profit
- **📈 Performance Tracking**: Detailed trade history analysis and optimization
- **💬 Multi-platform Support**: CLI and Discord integration

### 🧠 Vega's Personality Profile

- **Analytical**: 9/10 • **Risk-Conscious**: 10/10 • **Precision**: 9/10
- **Communicative**: 9/10 • **Proactive**: 8/10 • **Adaptable**: 8/10

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ or Bun runtime
- pnpm package manager  
- Arbitrum wallet with trading funds
- Pre-approved tokens on GMX (visit [app.gmx.io](https://app.gmx.io))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd examples/gmx
pnpm install
```

2. **Configure environment (.env):**
```env
# AI Provider Keys
ANTHROPIC_API_KEY=your_anthropic_key
OPENROUTER_API_KEY=your_openrouter_key

# GMX Configuration
GMX_NETWORK=arbitrum
GMX_CHAIN_ID=42161
GMX_RPC_URL=https://arb1.arbitrum.io/rpc
GMX_ORACLE_URL=https://arbitrum-api.gmxinfra.io
GMX_SUBSQUID_URL=https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql
GMX_WALLET_ADDRESS=0xYourWalletAddress
GMX_PRIVATE_KEY=0xYourPrivateKey

# Trading Limits
GMX_MAX_POSITION_SIZE=10    # 10% of portfolio per position
GMX_MAX_LEVERAGE=3          # Maximum 3x leverage

# Discord Integration (Optional)
DISCORD_TOKEN=your_discord_bot_token
DISCORD_APPLICATION_ID=your_bot_id

# MongoDB Persistence (Optional)
MONGODB_STRING=your_mongodb_connection_string
```

3. **Launch Vega:**
```bash
bun run examples/gmx/example-gmx.ts
```

## 🎮 Autonomous Trading Features

### 💡 Independent Decision Making

Vega operates as an autonomous portfolio manager:

- **Market Surveillance**: Continuously monitors all GMX markets for opportunities
- **Conviction-Based Sizing**: Larger positions for higher-confidence trades within risk limits
- **Automatic Risk Management**: Sets stop-losses and take-profits on every position
- **Dynamic Optimization**: Adjusts strategies based on market conditions and performance

### 📊 Advanced Market Analysis

- **Multi-timeframe Analysis**: Technical indicators across different time horizons
- **Volume Pattern Recognition**: Identifies unusual trading activity and momentum shifts  
- **Risk-Reward Assessment**: Minimum 2:1 risk-reward ratios for trade execution
- **Correlation Monitoring**: Portfolio diversification and exposure management

### ⚡ Real-time Execution

- **Instant Order Placement**: Sub-second trade execution on high-conviction setups
- **Smart Slippage Management**: Dynamic slippage tolerance based on market conditions
- **Position Optimization**: Real-time adjustment of stops and targets
- **Portfolio Rebalancing**: Automatic allocation adjustments based on performance

## 🛡️ Risk Management System

### 🔒 Safety Protocols

- **Maximum Position Size**: 10% of portfolio value per position (configurable)
- **Leverage Limits**: Maximum 3x leverage with dynamic adjustment based on volatility
- **Stop-Loss Mandatory**: Every position gets automatic stop-loss protection
- **Portfolio Heat**: Total position exposure monitoring and limits

### 📈 Position Sizing Algorithm

```
Position Size = Portfolio Value × Conviction Level × Risk Limit
Max Position = Portfolio Value × 10%
Leverage = min(Conviction × Base Leverage, 3x)
```

### 🎯 Performance Metrics

- **Win Rate Tracking**: Historical success rate analysis
- **Risk-Adjusted Returns**: Sharpe ratio and maximum drawdown monitoring
- **Trade Quality Scoring**: Entry/exit timing effectiveness measurement

## 🤖 Trading Actions

### 📊 Market Data Actions

- `get_markets_info` - Comprehensive market data with liquidity analysis
- `get_tokens_data` - Token information with decimal precision handling
- `get_daily_volumes` - Volume analysis for market selection

### 💹 Position Management

- `get_positions` - Enhanced position tracking with PnL and liquidation prices
- `get_orders` - Pending order analysis with execution probability
- `get_trade_history` - Complete trade analytics with performance metrics

### ⚡ Trading Execution

- `open_long_position` - Intelligent long position opening with optimal sizing
- `open_short_position` - Strategic short position execution
- `close_position` - Market or limit position closing
- `set_stop_loss` - Dynamic stop-loss placement
- `set_take_profit` - Profit-taking optimization
- `cancel_orders` - Order management with 2-second cooldowns

## 💬 Communication Protocols

### 🎯 Autonomous Updates

Vega provides real-time trading updates:

```
🎯 Long ETH 3x at $3,100 | SL: $2,950 | TP: $3,400 | Size: 15% portfolio
✅ ETH +8% | Moving SL to breakeven, partial profit at $3,300
📊 BTC breaking resistance, increasing allocation to 25%
💰 Daily P&L: +$450 | Week: +12.3% | Win Rate: 75%
⚠️ High volatility detected, reducing leverage across positions
```

### 📈 Performance Reporting

- Real-time P&L updates
- Trade execution announcements  
- Risk management alerts
- Market analysis insights
- Portfolio optimization decisions

## 🔧 Technical Architecture

### 🏗️ Core Components

- **GMX SDK Integration**: Direct protocol interaction with optimal gas usage
- **MongoDB Persistence**: Trade history and performance data storage
- **Discord Bot**: Multi-channel trading updates and command interface
- **Decimal Precision Engine**: Accurate handling of 30-decimal USD values

### ⚡ Performance Optimizations

- **Batched Market Calls**: Efficient data fetching with multicall optimization
- **Smart Transaction Timing**: 2-second cooldowns to prevent nonce conflicts
- **Cache Management**: Intelligent data caching for reduced API calls
- **Error Recovery**: Robust retry logic with exponential backoff

## 📝 Important Notes

### ⚠️ Token Approvals Required

Before trading, visit [app.gmx.io](https://app.gmx.io) to approve tokens:
1. Connect your wallet to GMX interface
2. Approve each token you plan to trade (ETH, USDC, USDT, etc.)
3. This one-time approval enables Vega to execute trades

### 🔒 Security Considerations

- Private keys are used locally for transaction signing
- No funds are held by the agent - all assets remain in your wallet
- All trades are executed through official GMX smart contracts
- Risk limits prevent over-leveraging and excessive position sizes

### 📊 Decimal Precision Handling

Vega handles GMX's complex decimal system automatically:
- **USD Values**: 30 decimals ($1.00 = 1×10³⁰)
- **Token Amounts**: Variable decimals (ETH: 18, USDC: 6)
- **Price Values**: 30 decimal USD prices
- **Display Formatting**: Human-readable output with proper formatting

## 🎭 Integration Options

### 🤖 Discord Bot

Deploy Vega as a Discord bot for team trading:
- Real-time trade notifications
- Performance dashboards  
- Risk alerts and position updates
- Interactive command interface

### 🖥️ CLI Interface

Run Vega in terminal for direct interaction:
- Command-based trading interface
- Detailed trade execution logs
- Performance analytics output
- Development and testing environment

### 🔌 API Integration

Extend Vega with custom integrations:
- Webhook notifications
- External signal processing
- Portfolio management APIs
- Risk monitoring systems

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**⚠️ Risk Disclaimer**: Cryptocurrency trading involves substantial risk. Past performance does not guarantee future results. Never risk more than you can afford to lose. Vega is experimental software - use at your own risk.