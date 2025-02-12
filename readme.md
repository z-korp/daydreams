<p align="center">
  <img src="./banner.png" alt="Daydreams">
</p>

> ⚠️ **Warning**: This is alpha software under active development. Expect
> frequent breaking changes and bugs. The API is not yet stable.

# Generative Agent Framework

Daydreams is a powerful framework for building generative agents that can
execute tasks across any blockchain or API.

- 🔗 Chain-agnostic blockchain interactions
- 👥 Multi-expert collaboration
- 🧠 Memory and context management made simple
- 🎯 Long term goal-oriented behavior
- 💾 Long-term memory made simple
- 🤔 Multi-step reasoning using Hierarchical Task Networks

## Supported Chains

<p> 
  <a href="#chain-support">
  <img src="./.github/eth-logo.svg" height="30" alt="Ethereum" style="margin: 0 10px;" />
  <img src="./.github/arbitrum-logo.svg" height="30" alt="Arbitrum" style="margin: 0 10px;" />
  <img src="./.github/optimism-logo.svg" height="30" alt="Optimism" style="margin: 0 10px;" />
  <img src="./.github/solana-logo.svg" height="30" alt="Hyperledger" style="margin: 0 10px;" />
  <img src="./.github/Starknet.svg" height="30" alt="StarkNet" style="margin: 0 10px;" />
  <img src="./.github/hl-logo.svg" height="30" alt="Hyperledger" style="margin: 0 10px;" />
  </a>
</p>

## Quick Start

Prerequisites:

- Node.js 18+ using [nvm](https://github.com/nvm-sh/nvm)
- [bun](https://bun.sh/)

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Run an example
bun run example:discord
```

## Concepts

All dreams agents are a collection of inputs, outputs, actions and memory.
Simple, and elegant.

```typescript
createDreams({
  inputs: {}, // sources of information
  outputs: {}, // ways to take action
  memory: createMemoryStore(), // storage for conversation history and state

  actions: [], // @optional discrete operations
  experts: [], // @optional specialized modules for specific tasks
  container: createContainer(), // @optional dependency injection container
});
```

- **Inputs** 📥 - Ways to receive information (Discord, Telegram, API webhooks
  etc)
- **Outputs** 📤 - Ways to take action (sending messages, making transactions
  etc)
- **Memory** 🧠 - Storage for conversation history and state
- **Actions** ⚡ - @optional Discrete operations the agent can perform
- **Experts** 🎓 - @optional Specialized modules for specific tasks
- **Container** 📦 - @optional dependency injection container

### Basic Usage

Dreams agents are all functional. `createDreams` is a function that returns an
agent object, which can be run with `await agent.run()`. Inject discord,
telegram, or any other input/output to the agent and define your own actions.

```typescript
const agent = createDreams({
  // @dev Use any LLM provider. All major providers are supported.
  model: groq("llama-70b"),

  // @dev Define your own memory store.
  memory: createMemoryStore(),

  // @dev Define your own inputs.
  inputs: {
    "discord:message": input({
      schema: messageSchema,
      handler: handleMessage,
    }),
  },

  // @dev Define your own outputs.
  outputs: {
    "discord:reply": output({
      schema: replySchema,
      handler: sendReply,
    }),
  },

  // @dev Define your own actions.
  actions: [searchWeb],
});

// Run the agent
await agent.run();
```

### Memory System

The memory system stores conversation history and execution state:

```typescript
// In-memory store
const memory = createMemoryStore();

// MongoDB store
const mongoMemory = await createMongoMemoryStore({
  uri: "mongodb://...",
  dbName: "dreams",
});
```

## Example Dreams Agents

```bash
# Discord bot
bun run example:discord

# Telegram bot
bun run example:telegram

# GitHub code assistant
bun run example:github
```

## Development

We use [bun](https://bun.sh/) for development.

```bash
# Build the project
bun build:core

# Generate docs
bun docs
```

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=daydreamsai/daydreams&type=Date)](https://star-history.com/#daydreamsai/daydreams&Date)
