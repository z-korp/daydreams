# GMX Trading Agent

## Overview

This agent helps you trade on the GMX decentralized exchange with AI-powered analysis and execution. It allows you to:

- Monitor market conditions
- Execute trades with leverage
- Manage open positions
- Track trading performance
- Get real-time market insights

The agent connects to the GMX protocol on Arbitrum using the GMX SDK, allowing secure and efficient trading directly from the chat interface.

## Setup

### Prerequisites

- Node.js v18 or later
- A wallet with private key access
- Funds on Arbitrum (ETH and tokens for trading)

### Installation

1. Clone the repository:
```bash
git clone [repository URL]
cd daydreams
```

2. Install dependencies:
```bash
bun install && bun build:packages
```

3. Set up environment variables (create a `.env` file):
```
ANTHROPIC_API_KEY=your_anthropic_api_key
GROQ_API_KEY=your_groq_api_key
GMX_NETWORK=arbitrum
GMX_CHAIN_ID=42161
GMX_ORACLE_URL=https://arbitrum-api.gmx.io/
GMX_RPC_URL=https://arb1.arbitrum.io/rpc
GMX_SUBSQUID_URL=https://api.thegraph.com/subgraphs/name/gmx-io/gmx-stats
GMX_WALLET_ADDRESS=your_wallet_address
GMX_PRIVATE_KEY=your_private_key
GMX_MAX_POSITION_SIZE=1000
GMX_MIN_POSITION_SIZE=10
GMX_MAX_LEVERAGE=10
GMX_SLIPPAGE_TOLERANCE=30
```

4. Start the agent:
```bash
bun run examples/gmx/example-gmx.ts
```

## Important: Token Approval Disclaimer

⚠️ **Token approval functionality is not fully implemented in this agent yet.** Before using the agent for trading, you must manually approve tokens for GMX to use:

1. Visit the [GMX interface](https://app.gmx.io/) and connect your wallet
2. For each token you wish to trade (USDC, USDT, ETH, etc.), perform a one-time approval transaction
3. This approval authorizes the GMX contracts to use your tokens

Without this manual approval step, trade execution will fail with "insufficient allowance" errors. We are working on adding automatic token approval in a future update.

## Usage

Once the agent is running, you can interact with it to:

### 1. Get Market Information

Ask for current market conditions, prices, volumes, and trading opportunities.

Example:
> "What are the current market conditions on GMX?"

### 2. View Your Positions and Orders

Check your open positions, pending orders, and account status.

Example:
> "Show me my current positions on GMX."

### 3. Create New Trades

Place new trades with specific parameters.

Example:
> "Open a long position on ETH with 5x leverage and $100 USD collateral."

### 4. Manage Risk

Set stop-losses, take-profits, and adjust position sizes.

Example:
> "Set a stop-loss for my ETH position at $2800."

### 5. Analyze Performance

Review your trading history and performance metrics.

Example:
> "What's my trading performance over the last 30 days?"

## Available Actions

The agent provides the following trading actions:

- **get_markets_info**: Get detailed market information
- **get_tokens_data**: View available tokens and their data
- **get_trades**: View current positions and orders
- **get_trade_history**: Analyze past trading activity
- **create_increase_order**: Open a new position or add to existing one
- **create_decrease_order**: Reduce or close a position
- **cancel_orders**: Cancel pending orders
- **create_swap_order**: Swap tokens on GMX

## Risk Management

The agent follows these risk management rules:

- Maximum position size: Configurable via `GMX_MAX_POSITION_SIZE`
- Maximum leverage: Configurable via `GMX_MAX_LEVERAGE`
- Slippage tolerance: Configurable via `GMX_SLIPPAGE_TOLERANCE`

Always practice responsible trading and never risk more than you can afford to lose.

## License

[MIT License](LICENSE) 