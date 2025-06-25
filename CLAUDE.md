# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo for Daydreams - a lightweight TypeScript framework for building stateful AI agents. The framework provides context management, action systems, and memory persistence across sessions.

## Commands

### Development
```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build:packages

# Build packages in watch mode
pnpm build:packages:watch

# Run tests (defaults to core package)
pnpm test

# Run tests for specific package
cd packages/[package-name] && pnpm test

# Format code
pnpm prettier

# Check for unused dependencies
pnpm knip

# Clean build artifacts
pnpm clean
```

### Documentation
```bash
# Run docs in development mode
pnpm docs:dev

# Build documentation site
pnpm docs:build

# Start documentation server
pnpm docs:start
```

### Release
```bash
# Run release process
pnpm release

# Dry run release
pnpm release -- --dry-run
```

## Architecture

### Core Components

1. **Context System** (`packages/core/src/context/`)
   - Manages conversation state with type-safe schemas
   - Supports nested contexts and composition
   - Provides memory management across sessions

2. **Action System** (`packages/core/src/actions/`)
   - Type-safe function registry for agent capabilities
   - Automatic parameter validation with Zod schemas
   - Built-in error handling and retry logic

3. **Memory Architecture** (`packages/core/src/memory/`)
   - Two-tier system: working memory + persistent storage
   - Support for multiple storage backends (Redis, SQLite, etc.)
   - Automatic serialization/deserialization

4. **Provider Integration** (`packages/core/src/providers/`)
   - Adapter pattern for LLM providers
   - Works with Vercel AI SDK, OpenAI, Anthropic, etc.
   - Stream-based message processing

### Package Structure

- `packages/core/` - Main framework with contexts, actions, and memory
- `packages/cli/` - Command-line interface for agent management
- `packages/create-agent/` - Scaffolding tool for new agents
- `packages/discord/`, `packages/twitter/`, `packages/telegram/` - Platform integrations
- `packages/*-memory/` - Storage backend implementations
- `examples/` - Reference implementations and demos
- `clients/example-ui/` - React-based UI example

### Key Design Patterns

1. **Monorepo with PNPM Workspaces** - Shared dependencies via catalog in `pnpm-workspace.yaml`
2. **Plugin Architecture** - Core framework with optional extensions
3. **TypeScript-First** - Full type safety with Zod runtime validation
4. **Event-Driven** - Stream-based processing for real-time responses
5. **Framework Agnostic** - Works alongside LangChain, Vercel AI SDK, etc.

## Development Guidelines

1. **Testing**: All new features should include tests using Vitest
2. **Type Safety**: Use TypeScript strict mode and Zod schemas for runtime validation
3. **Code Style**: Run `pnpm prettier` before committing
4. **Commits**: Follow Conventional Commits specification
5. **Dependencies**: Check with `pnpm knip` before adding new dependencies

## Environment Setup

Copy `.env.example` to `.env` and configure:
- LLM provider API keys (GROQ_API_KEY, OPENROUTER_API_KEY, etc.)
- Blockchain RPC URLs and keys if using chain integrations
- Other service-specific credentials as needed

## Common Tasks

### Adding a New Package
1. Create directory under `packages/`
2. Add to `pnpm-workspace.yaml` if needed
3. Use shared `tsup.config.ts` for build configuration
4. Add package-specific scripts to `package.json`

### Creating an Example
1. Add directory under `examples/`
2. Use `@daydreamsai/core` as dependency
3. Include README with clear setup instructions
4. Add to documentation if significant feature demo

### Debugging
- Use `DEBUG=daydreams:*` environment variable for verbose logging
- Check `packages/core/src/logger/` for logging utilities
- Use Vitest UI for interactive test debugging: `pnpm test:ui`

## Documentation Reference

The following documentation has been compiled for quick reference:

file: ./content/docs/core/first-agent.mdx
meta: {
  "title": "Your first agent",
  "description": "Build your first Daydreams agent."
}
        
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

## Overview

Daydreams is a framework for building autonomous AI agents. At its core, an
agent operates through a continuous cycle:

1. **Analyzes** incoming information (inputs)
2. **Reasons** about it using a Large Language Model (LLM)
3. **Decides** on the next steps - either generating a response (output) or
   performing a task (action)
4. **Feeds results** back into the agent's awareness, creating a continuous loop
   orchestrated by the LLM

This enables you to build agents that can interact with various systems like
blockchains, social media platforms, APIs, and more, all based on predefined
goals and contextual understanding.

## Installation

Install the core Daydreams packages:

<Tabs groupId="language" items={["pnpm", "npm", "bun", "yarn"]} persist>
  <Tab value="pnpm">pnpm add @daydreamsai/core @daydreamsai/cli</Tab>
  <Tab value="npm">npm install @daydreamsai/core @daydreamsai/cli</Tab>
  <Tab value="bun">bun add @daydreamsai/core @daydreamsai/cli</Tab>
  <Tab value="yarn">yarn add @daydreamsai/core @daydreamsai/cli</Tab>
</Tabs>

You'll also need an LLM provider SDK. For this guide, we'll use OpenAI:

<Tabs groupId="language" items={["pnpm", "npm", "bun", "yarn"]} persist>
  <Tab value="pnpm">pnpm add @ai-sdk/openai</Tab>
  <Tab value="npm">npm install @ai-sdk/openai</Tab>
  <Tab value="bun">bun add @ai-sdk/openai</Tab>
  <Tab value="yarn">yarn add @ai-sdk/openai</Tab>
</Tabs>

**Important:** Make sure you have an `OPENAI_API_KEY` environment variable set
before proceeding.

## Core Concepts

Daydreams is built around several key components that work together:

### Essential Components

* **[Agent Lifecycle](/docs/core/concepts/agent-lifecycle)** - The central
  orchestrator that runs the main loop
* **[Contexts](/docs/core/concepts/contexts)** - Manages state and memory for
  specific tasks or interactions (e.g., a chat session)
* **[Inputs](/docs/core/concepts/inputs)** - How agents receive information
  (e.g., CLI messages, API events)
* **[Outputs](/docs/core/concepts/outputs)** - How agents respond or send
  information (e.g., CLI responses, tweets)
* **[Actions](/docs/core/concepts/actions)** - Tasks agents can perform (e.g.,
  calling APIs, executing transactions)
* **[Memory](/docs/core/concepts/memory)** - How agents store and recall
  information (working memory, episodic memory)

For detailed information about these concepts, visit the
[Core Concepts](/docs/core/concepts/core) section.

## Your First Agent (CLI Echo Bot)

Let's build a simple agent that echoes back whatever you type in the command
line. This example demonstrates the basic structure and workflow of a Daydreams
agent.

### Step 1: Set up your project

```bash title="create-project.sh"
mkdir my-first-agent && cd my-first-agent
```

<Tabs groupId="language" items={["pnpm", "npm", "bun", "yarn"]} persist>
  <Tab value="pnpm">
    pnpm add @daydreamsai/core @daydreamsai/cli @ai-sdk/openai zod
  </Tab>

  <Tab value="npm">
    npm install @daydreamsai/core @daydreamsai/cli @ai-sdk/openai zod
  </Tab>

  <Tab value="bun">
    bun add @daydreamsai/core @daydreamsai/cli @ai-sdk/openai
  </Tab>

  <Tab value="yarn">
    yarn add @daydreamsai/core @daydreamsai/cli @ai-sdk/openai zod
  </Tab>
</Tabs>

### Step 2: Create your agent

### Step 3: Run your agent

Ensure your `OPENAI_API_KEY` environment variable is set, then run:

```bash title="run-agent.sh"
node agent.ts
```

Your agent will start listening for input. Type any message and watch as the
agent echoes it back using the LLM and CLI handlers provided by the
`cliExtension`.

## What is an AI Agent?

Think of an AI agent as a smart assistant that can:

* **Listen** for events (Discord messages, API calls, timers)
* **Think** about what to do (using AI models like GPT)
* **Take action** (call APIs, send responses, update databases)
* **Remember** what happened for future interactions

## Real Examples

Here are some agents you could build with Daydreams:

### Discord Weather Bot

```typescript title="weather-bot.ts"
// When someone says "what's the weather?"
// → Agent calls weather API
// → Agent responds: "It's 72°F and sunny in San Francisco"
```

### Trading Assistant

```typescript title="trading-bot.ts"
// When market conditions change
// → Agent analyzes data
// → Agent executes trades or sends alerts
```

### Customer Support Bot

```typescript title="support-bot.ts"
// When customer sends message
// → Agent checks knowledge base
// → Agent provides help or escalates to human
```

file: ./content/docs/core/advanced/extensions-vs-services.mdx
meta: {
  "title": "Extensions vs Services",
  "description": "Understanding the difference between extensions and services in Daydreams."
}
        
## What Are Extensions and Services?

Think of building an agent like assembling a computer:

* **Services** are like **individual components** (hard drive, graphics card,
  RAM)
* **Extensions** are like **complete packages** (gaming bundle, productivity
  suite)

## Real Examples

### Services: Individual Components

```typescript title="database-service.ts"
// A service manages ONE specific thing
const databaseService = service({
  name: "database",

  // How to create the database connection
  register: (container) => {
    container.singleton("db", () => new Database(process.env.DB_URL));
  },

  // How to initialize it when agent starts
  boot: async (container) => {
    const db = container.resolve("db");
    await db.connect();
    console.log("Database connected!");
  },
});
```

### Extensions: Complete Packages

```typescript title="discord-extension.ts"
// An extension bundles EVERYTHING for a feature
const discordExtension = extension({
  name: "discord",

  // Services this extension needs
  services: [discordService], // Manages Discord client

  // All the Discord-related features
  contexts: { discord: discordContext },
  actions: [sendMessageAction, createChannelAction],
  inputs: { "discord:message": messageInput },
  outputs: { "discord:reply": replyOutput },
});
```

## The Problem: Managing Complexity

Without this separation, you'd have to set up everything manually:

```typescript title="manual-setup.ts"
// ❌ Without extensions/services - manual setup nightmare
const agent = createDreams({
  model: openai("gpt-4o"),

  // You'd have to manually configure EVERYTHING
  contexts: {
    discord: discordContext,
    twitter: twitterContext,
    database: databaseContext,
    // ... 50+ more contexts
  },

  actions: [
    sendDiscordMessage,
    createDiscordChannel,
    sendTweet,
    followUser,
    saveToDatabase,
    queryDatabase,
    // ... 100+ more actions
  ],

  // Plus manually manage all the connections, API clients, etc.
  // This becomes unmanageable quickly!
});
```

## The Solution: Organized Architecture

With extensions and services, it's clean and simple:

```typescript title="organized-setup.ts"
// ✅ With extensions/services - clean and simple
const agent = createDreams({
  model: openai("gpt-4o"),

  // Just add the features you want
  extensions: [
    discord, // Adds Discord support + client management
    twitter, // Adds Twitter support + API management
    mongoMemory, // Adds database memory + connection management
  ],

  // That's it! Each extension handles its own complexity
});
```

## How They Work Together

### Services Handle the "How"

Services manage the technical details of connecting to external systems:

```typescript title="discord-service.ts"
const discordService = service({
  name: "discord",

  // HOW to create the Discord client
  register: (container) => {
    container.singleton(
      "discordClient",
      () =>
        new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
          token: process.env.DISCORD_TOKEN,
        })
    );
  },

  // HOW to initialize it
  boot: async (container) => {
    const client = container.resolve("discordClient");
    await client.login();
    console.log("Discord client ready!");
  },
});
```

### Extensions Handle the "What"

Extensions bundle all the features users actually want:

```typescript title="discord-extension-complete.ts"
const discord = extension({
  name: "discord",

  // Use the service for client management
  services: [discordService],

  // WHAT the agent can do with Discord
  contexts: {
    discord: context({
      type: "discord",
      schema: z.object({ guildId: z.string(), channelId: z.string() }),

      create: () => ({
        messageHistory: [],
        memberCount: 0,
      }),

      render: (state) => `
Discord Server: ${state.args.guildId}
Channel: ${state.args.channelId}
Members: ${state.memory.memberCount}
Recent messages: ${state.memory.messageHistory.slice(-3).join("\n")}
      `,
    }),
  },

  actions: [
    action({
      name: "send-discord-message",
      description: "Send a message to a Discord channel",
      schema: z.object({
        channelId: z.string(),
        content: z.string(),
      }),

      handler: async ({ channelId, content }, ctx) => {
        const client = ctx.container.resolve("discordClient");
        const channel = await client.channels.fetch(channelId);
        await channel.send(content);
        return { sent: true, messageId: result.id };
      },
    }),
  ],

  inputs: {
    "discord:message": input({
      subscribe: (send, agent) => {
        const client = agent.container.resolve("discordClient");

        client.on("messageCreate", (message) => {
          if (message.author.bot) return;

          send({
            type: "discord:message",
            data: {
              content: message.content,
              author: message.author.username,
              channelId: message.channel.id,
              guildId: message.guild?.id,
            },
          });
        });
      },
    }),
  },

  outputs: {
    "discord:reply": output({
      schema: z.object({
        content: z.string(),
        channelId: z.string(),
      }),

      handler: async ({ content, channelId }, ctx) => {
        const client = ctx.container.resolve("discordClient");
        const channel = await client.channels.fetch(channelId);
        await channel.send(content);
      },
    }),
  },
});
```

## When to Use Each

### Create a Service When:

* Managing an external connection (database, API client)
* Sharing utilities across multiple features
* Handling lifecycle management (startup, shutdown)

```typescript title="when-to-use-service.ts"
// ✅ Good service examples
const redisService = service({
  /* manage Redis connection */
});
const loggerService = service({
  /* configure logging */
});
const webhookService = service({
  /* handle webhook server */
});
```

### Create an Extension When:

* Bundling a complete feature set
* Adding support for a new platform (Discord, Twitter, etc.)
* Packaging related actions/contexts/inputs/outputs

```typescript title="when-to-use-extension.ts"
// ✅ Good extension examples
const twitter = extension({
  /* everything for Twitter integration */
});
const tradingBot = extension({
  /* everything for trading features */
});
const gameEngine = extension({
  /* everything for game mechanics */
});
```

## Practical Example: Building a Trading Extension

Let's see how they work together in practice:

### 1. First, Create Services for External APIs

```typescript title="trading-services.ts"
const alpacaService = service({
  name: "alpaca",
  register: (container) => {
    container.singleton(
      "alpacaClient",
      () =>
        new AlpacaApi({
          key: process.env.ALPACA_KEY,
          secret: process.env.ALPACA_SECRET,
          paper: process.env.NODE_ENV !== "production",
        })
    );
  },
  boot: async (container) => {
    const client = container.resolve("alpacaClient");
    await client.authenticate();
  },
});

const marketDataService = service({
  name: "marketData",
  register: (container) => {
    container.singleton(
      "marketClient",
      () => new MarketDataClient(process.env.MARKET_DATA_KEY)
    );
  },
});
```

### 2. Then, Create Extension Using Those Services

```typescript title="trading-extension.ts"
const trading = extension({
  name: "trading",

  // Use the services we created
  services: [alpacaService, marketDataService],

  // Bundle all trading features
  contexts: {
    portfolio: portfolioContext,
    watchlist: watchlistContext,
  },

  actions: [buyStockAction, sellStockAction, getQuoteAction, setStopLossAction],

  inputs: {
    "market:price-alert": priceAlertInput,
    "market:news": newsInput,
  },

  outputs: {
    "trading:order-confirmation": orderOutput,
    "trading:alert": alertOutput,
  },
});
```

### 3. Use the Extension in Your Agent

```typescript title="trading-agent.ts"
const agent = createDreams({
  model: openai("gpt-4o"),

  // Just add the extension - everything works automatically!
  extensions: [trading],

  // Now your agent can trade stocks with full context awareness
});

// Agent can now:
// - Listen for price alerts (inputs)
// - Check portfolio status (contexts)
// - Execute trades (actions)
// - Send confirmations (outputs)
// - All using properly managed API connections (services)
```

## Architecture Summary

```text title="architecture-flow.txt"
Extension (trading)
├── Services (how to connect)
│   ├── alpacaService → manages trading API client
│   └── marketDataService → manages market data client
│
└── Features (what agent can do)
    ├── Contexts → portfolio, watchlist state
    ├── Actions → buy, sell, get quotes
    ├── Inputs → listen for price alerts
    └── Outputs → send trade confirmations

When you add the extension to your agent:
1. Services get registered and initialized automatically
2. All features become available to the LLM
3. API clients are properly managed and shared
4. Everything works together seamlessly
```

## Key Differences

| Aspect          | Service                     | Extension                          |
| --------------- | --------------------------- | ---------------------------------- |
| **Purpose**     | Manages infrastructure      | Provides features                  |
| **Contains**    | Connection logic, utilities | Actions, contexts, inputs, outputs |
| **Lifecycle**   | `register()` → `boot()`     | `install()` when added             |
| **Reusability** | Used by multiple extensions | Used by agents                     |
| **Analogy**     | Computer component          | Software package                   |

## Best Practices

### Service Design

```typescript title="good-service.ts"
// ✅ Good - focused on one responsibility
const databaseService = service({
  name: "database",
  register: (container) => {
    // Just database connection management
    container.singleton("db", () => new Database(process.env.DB_URL));
  },
});

// ❌ Bad - doing too many things
const everythingService = service({
  name: "everything",
  register: (container) => {
    // Don't mix database, API clients, loggers, etc.
    container.singleton("db", () => new Database(/* ... */));
    container.singleton("api", () => new ApiClient(/* ... */));
    container.singleton("logger", () => new Logger(/* ... */));
  },
});
```

### Extension Design

```typescript title="good-extension.ts"
// ✅ Good - cohesive feature set
const discord = extension({
  name: "discord",
  services: [discordService], // Only Discord-related services
  // All features work together for Discord integration
});

// ❌ Bad - unrelated features mixed together
const mixedExtension = extension({
  name: "mixed",
  services: [discordService, twitterService, databaseService],
  // Discord actions mixed with Twitter contexts - confusing!
});
```

## Next Steps

* **[Extensions Guide](/docs/core/advanced/extensions)** - Learn to build your
  own extensions
* **[Built-in Extensions](/docs/tutorials/examples)** - See real extension
  examples
* **[Service Patterns](/docs/core/advanced/services)** - Advanced service
  techniques

## Key Takeaways

* **Services manage "how"** - Connection setup, lifecycle, dependencies
* **Extensions manage "what"** - Features users actually want
* **Clean separation** - Infrastructure vs functionality
* **Easy composition** - Add extensions like LEGO blocks
* **Automatic management** - Framework handles the wiring

This architecture lets you build complex agents by combining simple, focused
pieces.


file: ./content/docs/core/advanced/extensions.mdx
meta: {
  "title": "Extensions",
  "description": "Building your own modular Daydreams extensions."
}
        
## What Are Extensions?

Extensions are **feature packages** for your agent. Think of them like apps on
your phone - each one adds specific capabilities without you having to build
everything from scratch.

## Real Examples

Here's what extensions look like in practice:

### Using Built-in Extensions

```typescript title="using-extensions.ts"
import { createDreams } from "@daydreamsai/core";
import { discord } from "@daydreamsai/discord";
import { twitter } from "@daydreamsai/twitter";

const agent = createDreams({
  model: openai("gpt-4o"),

  // Add extensions like installing apps
  extensions: [
    discord, // Now agent can read/send Discord messages
    twitter, // Now agent can read/send tweets
  ],
});

// That's it! Your agent now speaks Discord and Twitter
```

### What Each Extension Gives You

```typescript title="extension-features.ts"
// The Discord extension adds:
// ✅ Automatic Discord client connection
// ✅ Listen for Discord messages (inputs)
// ✅ Send Discord replies (outputs)
// ✅ Track conversation context (contexts)
// ✅ Discord-specific actions (ban, kick, etc.)

// The Twitter extension adds:
// ✅ Twitter API client management
// ✅ Listen for mentions/DMs (inputs)
// ✅ Send tweets/replies (outputs)
// ✅ Track follower context (contexts)
// ✅ Twitter actions (follow, like, retweet)
```

## The Problem: Building Everything From Scratch

Without extensions, you'd have to build every feature manually:

```typescript title="manual-agent-building.ts"
// ❌ Without extensions - hundreds of lines of setup code
const agent = createDreams({
  model: openai("gpt-4o"),

  // Manually define every context
  contexts: {
    discordGuild: context({
      /* Discord server context */
    }),
    discordChannel: context({
      /* Discord channel context */
    }),
    discordUser: context({
      /* Discord user context */
    }),
    twitterUser: context({
      /* Twitter user context */
    }),
    twitterThread: context({
      /* Twitter thread context */
    }),
    // ... 50+ more contexts
  },

  // Manually define every action
  actions: [
    action({ name: "send-discord-message" /* ... lots of code ... */ }),
    action({ name: "ban-discord-user" /* ... lots of code ... */ }),
    action({ name: "create-discord-channel" /* ... lots of code ... */ }),
    action({ name: "send-tweet" /* ... lots of code ... */ }),
    action({ name: "follow-twitter-user" /* ... lots of code ... */ }),
    // ... 100+ more actions
  ],

  // Manually set up all the inputs/outputs
  inputs: {
    "discord:message": input({
      /* Complex Discord API setup */
    }),
    "discord:reaction": input({
      /* More Discord API code */
    }),
    "twitter:mention": input({
      /* Complex Twitter API setup */
    }),
    // ... dozens more
  },

  // Plus manage all the API clients, authentication, etc.
  // This would be thousands of lines of code!
});
```

## The Solution: Extensions Package Everything

With extensions, complex features become simple one-liners:

```typescript title="simple-agent-building.ts"
// ✅ With extensions - clean and simple
const agent = createDreams({
  model: openai("gpt-4o"),

  extensions: [
    discord, // Hundreds of lines of Discord integration
    twitter, // Hundreds of lines of Twitter integration
  ],

  // Done! Everything just works
});
```

## Building Your First Extension

Let's build a simple weather extension step by step:

### 1. Define What Your Extension Does

```typescript title="weather-extension-plan.ts"
// Weather extension should provide:
// - Action to get current weather
// - Action to get weather forecast
// - Context to remember user's preferred location
// - Service to manage weather API client
```

### 2. Create the Service (API Management)

```typescript title="weather-service.ts"
import { service } from "@daydreamsai/core";

const weatherService = service({
  name: "weather",

  // How to create the weather API client
  register: (container) => {
    container.singleton("weatherClient", () => ({
      apiKey: process.env.WEATHER_API_KEY,
      baseUrl: "https://api.openweathermap.org/data/2.5",

      async getCurrentWeather(location: string) {
        const response = await fetch(
          `${this.baseUrl}/weather?q=${location}&appid=${this.apiKey}&units=metric`
        );
        return response.json();
      },

      async getForecast(location: string) {
        const response = await fetch(
          `${this.baseUrl}/forecast?q=${location}&appid=${this.apiKey}&units=metric`
        );
        return response.json();
      },
    }));
  },

  // Initialize when agent starts
  boot: async (container) => {
    const client = container.resolve("weatherClient");
    console.log("Weather service ready!");
  },
});
```

### 3. Create the Context (User Preferences)

```typescript title="weather-context.ts"
import { context } from "@daydreamsai/core";
import { z } from "zod";

const weatherContext = context({
  type: "weather-preferences",
  schema: z.object({ userId: z.string() }),

  create: () => ({
    defaultLocation: null,
    units: "metric", // celsius by default
    lastChecked: null,
    favoriteLocations: [],
  }),

  render: (state) => `
User Weather Preferences:
- Default location: ${state.memory.defaultLocation || "Not set"}
- Units: ${state.memory.units}
- Favorite locations: ${state.memory.favoriteLocations.join(", ") || "None"}
- Last checked: ${state.memory.lastChecked || "Never"}
  `,
});
```

### 4. Create the Actions (What Agent Can Do)

```typescript title="weather-actions.ts"
import { action } from "@daydreamsai/core";
import { z } from "zod";

const getCurrentWeatherAction = action({
  name: "get-current-weather",
  description: "Get the current weather for a location",
  schema: z.object({
    location: z.string().describe("City name, e.g., 'San Francisco, CA'"),
  }),

  handler: async ({ location }, ctx) => {
    const weatherClient = ctx.container.resolve("weatherClient");

    try {
      const weather = await weatherClient.getCurrentWeather(location);

      // Update user's context
      ctx.memory.lastChecked = new Date().toISOString();
      if (!ctx.memory.defaultLocation) {
        ctx.memory.defaultLocation = location;
      }

      return {
        success: true,
        location: weather.name,
        temperature: `${weather.main.temp}°C`,
        description: weather.weather[0].description,
        humidity: `${weather.main.humidity}%`,
        windSpeed: `${weather.wind.speed} m/s`,
      };
    } catch (error) {
      return {
        success: false,
        error: "Could not fetch weather data",
        message: error.message,
      };
    }
  },
});

const setDefaultLocationAction = action({
  name: "set-default-weather-location",
  description: "Set user's default location for weather",
  schema: z.object({
    location: z.string(),
  }),

  handler: async ({ location }, ctx) => {
    ctx.memory.defaultLocation = location;

    // Add to favorites if not already there
    if (!ctx.memory.favoriteLocations.includes(location)) {
      ctx.memory.favoriteLocations.push(location);
    }

    return {
      success: true,
      message: `Default location set to ${location}`,
    };
  },
});
```

### 5. Bundle Everything Into an Extension

```typescript title="weather-extension.ts"
import { extension } from "@daydreamsai/core";

export const weather = extension({
  name: "weather",

  // Services this extension needs
  services: [weatherService],

  // Contexts this extension provides
  contexts: {
    "weather-preferences": weatherContext,
  },

  // Actions this extension provides
  actions: [getCurrentWeatherAction, setDefaultLocationAction],

  // Optional: Run setup when extension is added
  install: async (agent) => {
    console.log("Weather extension installed!");
    // Could do additional setup here if needed
  },
});
```

### 6. Use Your Extension

```typescript title="weather-agent.ts"
import { createDreams } from "@daydreamsai/core";
import { weather } from "./weather-extension";

const agent = createDreams({
  model: openai("gpt-4o"),
  extensions: [weather],
});

await agent.start();

// Now your agent can:
// - Check weather for any location
// - Remember user's preferred locations
// - Set default locations for users
// - All with proper API management
```

## Extension Lifecycle

Here's what happens when your agent starts:

```text title="extension-lifecycle.txt"
1. Agent Creation
   └── Extensions added to agent.extensions[]

2. agent.start() called
   ├── For each extension:
   │   ├── Register all services
   │   ├── Merge contexts into agent
   │   ├── Merge actions into agent
   │   ├── Merge inputs into agent
   │   └── Merge outputs into agent
   │
   ├── Boot all services (connect to APIs, databases, etc.)
   │
   ├── Call extension.install() for each extension
   │
   └── Start all inputs (begin listening for events)

3. Agent Ready
   └── All extension features available to LLM
```

## Advanced Extension Features

### Inputs and Outputs

Extensions can also define how agents listen and respond:

```typescript title="weather-inputs-outputs.ts"
const weatherExtension = extension({
  name: "weather",

  // ... services, contexts, actions ...

  // Listen for weather-related events
  inputs: {
    "weather:alert": input({
      subscribe: (send, agent) => {
        // Listen for severe weather alerts
        const weatherClient = agent.container.resolve("weatherClient");

        setInterval(async () => {
          const alerts = await weatherClient.getAlerts();

          for (const alert of alerts) {
            send({
              type: "weather:alert",
              data: {
                type: alert.type,
                severity: alert.severity,
                location: alert.location,
                message: alert.message,
              },
            });
          }
        }, 60000); // Check every minute
      },
    }),
  },

  // Send weather notifications
  outputs: {
    "weather:notification": output({
      schema: z.object({
        message: z.string(),
        location: z.string(),
        urgency: z.enum(["low", "medium", "high"]),
      }),

      handler: async ({ message, location, urgency }, ctx) => {
        // Could send via email, SMS, Discord, etc.
        console.log(
          `[${urgency.toUpperCase()}] Weather alert for ${location}: ${message}`
        );

        // Could also trigger other actions based on urgency
        if (urgency === "high") {
          // Maybe send emergency notifications
        }
      },
    }),
  },
});
```

### Extension Dependencies

Extensions can depend on other extensions:

```typescript title="weather-discord-extension.ts"
import { discord } from "@daydreamsai/discord";
import { weather } from "./weather-extension";

const weatherDiscordBot = extension({
  name: "weather-discord-bot",

  // This extension requires both Discord and Weather
  services: [], // No additional services needed

  // Add a Discord-specific weather command
  actions: [
    action({
      name: "send-weather-to-discord",
      description: "Send weather info to a Discord channel",
      schema: z.object({
        channelId: z.string(),
        location: z.string(),
      }),

      handler: async ({ channelId, location }, ctx) => {
        // Use weather extension's client
        const weatherClient = ctx.container.resolve("weatherClient");
        const weather = await weatherClient.getCurrentWeather(location);

        // Use Discord extension's client
        const discordClient = ctx.container.resolve("discordClient");
        const channel = await discordClient.channels.fetch(channelId);

        await channel.send(
          `🌤️ Weather in ${location}: ${weather.main.temp}°C, ${weather.weather[0].description}`
        );

        return { success: true };
      },
    }),
  ],
});

// Use all three extensions together
const agent = createDreams({
  model: openai("gpt-4o"),
  extensions: [
    discord, // Provides Discord functionality
    weather, // Provides weather functionality
    weatherDiscordBot, // Combines both for Discord weather bot
  ],
});
```

## Best Practices

### 1. Focus on One Domain

```typescript title="focused-extension.ts"
// ✅ Good - focused on weather
const weather = extension({
  name: "weather",
  // All features related to weather
});

// ❌ Bad - mixing unrelated features
const everything = extension({
  name: "everything",
  // Weather + Discord + Trading + Gaming features mixed together
});
```

### 2. Provide Complete Functionality

```typescript title="complete-extension.ts"
// ✅ Good - provides everything needed for weather
const weather = extension({
  name: "weather",
  services: [weatherService], // API management
  contexts: { preferences: weatherContext }, // User preferences
  actions: [getCurrentWeather, setLocation], // Core functionality
  inputs: { alerts: weatherAlerts }, // Listen for alerts
  outputs: { notify: weatherNotify }, // Send notifications
});

// ❌ Bad - incomplete, missing key features
const incompleteWeather = extension({
  name: "weather",
  actions: [getCurrentWeather], // Only one action, no context or API management
});
```

### 3. Clear Service Dependencies

```typescript title="clear-dependencies.ts"
// ✅ Good - clear what services this extension needs
const trading = extension({
  name: "trading",
  services: [
    alpacaService, // For executing trades
    marketDataService, // For getting quotes
    riskService, // For risk management
  ],
  // ... rest of extension
});

// ❌ Bad - unclear dependencies
const trading = extension({
  name: "trading",
  services: [
    everythingService, // What does this provide?
  ],
});
```

### 4. Meaningful Names

```typescript title="meaningful-names.ts"
// ✅ Good - clear what each extension does
const discord = extension({ name: "discord" });
const weather = extension({ name: "weather" });
const tradingBot = extension({ name: "trading-bot" });

// ❌ Bad - unclear names
const ext1 = extension({ name: "ext1" });
const myStuff = extension({ name: "my-stuff" });
const helper = extension({ name: "helper" });
```

## Publishing Extensions

Once you've built an extension, you can share it:

### 1. Package Structure

```text title="extension-package.txt"
my-weather-extension/
├── src/
│   ├── services/
│   │   └── weather-service.ts
│   ├── contexts/
│   │   └── weather-context.ts
│   ├── actions/
│   │   ├── get-weather.ts
│   │   └── set-location.ts
│   ├── index.ts              # Export the extension
│   └── types.ts              # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Package.json

```json title="package.json"
{
  "name": "@yourorg/daydreams-weather",
  "version": "1.0.0",
  "description": "Weather extension for Daydreams agents",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@daydreamsai/core": "^1.0.0"
  },
  "dependencies": {
    "zod": "^3.0.0"
  }
}
```

### 3. Export Your Extension

```typescript title="src/index.ts"
export { weather } from "./weather-extension";
export type { WeatherData, WeatherAlert } from "./types";
```

### 4. Usage by Others

```typescript title="using-published-extension.ts"
import { createDreams } from "@daydreamsai/core";
import { weather } from "@yourorg/daydreams-weather";

const agent = createDreams({
  model: openai("gpt-4o"),
  extensions: [weather],
});
```

## Next Steps

* **[Extensions vs Services](/docs/core/advanced/extensions-vs-services)** -
  Understand when to use each
* **[Built-in Extensions](/docs/tutorials/examples)** - Explore existing
  extensions
* **[Discord Extension](/docs/tutorials/discord)** - See a complete extension
  example

## Key Takeaways

* **Extensions are feature packages** - Like apps for your agent
* **Bundle related functionality** - Contexts, actions, inputs, outputs together
* **Automatic lifecycle management** - Services boot, features register
  automatically
* **Reusable and shareable** - Build once, use everywhere
* **Clean agent configuration** - Add complex features with one line

Extensions let you build powerful agents by combining focused, reusable feature
packages.


file: ./content/docs/core/advanced/grpo-training-export.mdx
meta: {
  "title": "Training Data Export for GRPO",
  "description": "This guide explains how to export episodic memories as training data for Group Relative Policy Optimization (GRPO) using the Daydreams AI core package."
}
        
## What is GRPO Training?

GRPO (Group Relative Policy Optimization) is a reinforcement learning algorithm
designed to enhance reasoning capabilities in large language models. It
optimizes memory usage and is particularly effective for tasks requiring complex
problem-solving, such as:

* Mathematical reasoning
* Decision-making scenarios
* Step-by-step problem solving
* Game-based learning environments

**Key Benefits of GRPO:**

* Improves reasoning capabilities beyond standard fine-tuning
* Optimizes memory usage compared to traditional PPO
* Particularly effective for complex problem-solving tasks

## Workflow Overview

Your Daydreams agent can build reasoning traces for GRPO training by following
this structured workflow:

1. **Define Prompt Sources** - Use static datasets or interactive environments
2. **Generate Reasoning Traces** - Create completions that include thought
   processes
3. **Store and Save Data** - Export in JSONL format compatible with training
   tools

## Enabling Automatic Export

You can configure Daydreams to automatically export training data after each
episode:

```typescript
import { createDreams } from "@daydreamsai/core";

const agent = createDreams({
  model: openai("gpt-4-turbo"),
  exportTrainingData: true,
  trainingDataPath: "./grpo-training-data.jsonl", // Optional, defaults to "./training-data.jsonl"
  // ... other configuration options
});
```

**Note:** If you don't specify `trainingDataPath`, Daydreams will save the data
to `./training-data.jsonl` in your project root.

## Manual Export

You can manually export all episodes as training data:

```typescript
// Export using the default path from your agent configuration
await agent.exportAllTrainingData();

// Or specify a custom path
await agent.exportAllTrainingData("./custom-path/grpo-training-data.jsonl");
```

## Understanding the Data Format for GRPO

Daydreams exports training data in JSONL (JSON Lines) format, optimized for GRPO
training. Each line contains a JSON object with:

```json
{
  "prompt": "You are in a dark room with a door to the north.",
  "completion": "I need to find a way out. I should check if the door is locked.\n\nI found the door was unlocked and was able to exit the room."
}
```

The format includes:

* **prompt**: The observation or context provided to the agent
* **completion**: The agent's reasoning process and action results

For interactive environments, ensure completions include both reasoning and an
explicit action statement:

```json
{
  "prompt": "You are in a dark room with a door to the north.",
  "completion": "I need to find a way out. I should check if the door is locked.\n\nAction: try opening the door"
}
```

## Creating Custom Training Pairs for GRPO

For advanced use cases, you can create custom training data pairs specifically
designed for GRPO:

## Optimizing Data for GRPO Training

To maximize the effectiveness of your GRPO training data:

1. **Include diverse scenarios** - Ensure your agent encounters a variety of
   situations
2. **Capture step-by-step reasoning** - The completion should show the agent's
   thought process
3. **Format actions consistently** - Use patterns like "Action: \[action]" for
   easy parsing
4. **Balance task difficulty** - Include both simple and complex reasoning
   challenges

## Customizing the Export Format

If you need a different format for your specific GRPO training framework:

1. Create your own formatter function based on the Daydreams utilities
2. Process the episodic memories to match your required format
3. Save the data using your preferred file structure

**Example use case:** You might need to add additional metadata fields like task
difficulty or domain type to help with training organization.


file: ./content/docs/core/advanced/services.mdx
meta: {
  "title": "Services",
  "description": "Dependency Injection & Lifecycle Management."
}
        
## What Are Services?

Services are **infrastructure managers** for your agent. Think of them like the
utilities in a city - you don't think about electricity or water pipes, but
everything depends on them working properly.

## Real Examples

Here's what services handle in your agent:

### Database Connections

```typescript title="database-service.ts"
// Service manages database connection lifecycle
const databaseService = service({
  name: "database",

  register: (container) => {
    // HOW to create database connection
    container.singleton("db", () => new MongoDB(process.env.MONGODB_URI));
  },

  boot: async (container) => {
    // WHEN to connect (agent startup)
    const db = container.resolve("db");
    await db.connect();
    console.log("✅ Database connected!");
  },
});

// Now any action can use the database:
// const db = ctx.container.resolve("db");
// await db.collection("users").findOne({ id: userId });
```

### API Client Management

```typescript title="discord-service.ts"
// Service manages Discord client lifecycle
const discordService = service({
  name: "discord",

  register: (container) => {
    // HOW to create Discord client
    container.singleton(
      "discordClient",
      () =>
        new Discord.Client({
          intents: [Discord.GatewayIntentBits.Guilds],
          token: process.env.DISCORD_TOKEN,
        })
    );
  },

  boot: async (container) => {
    // WHEN to connect (agent startup)
    const client = container.resolve("discordClient");
    await client.login();
    console.log("✅ Discord bot online!");
  },
});

// Now any action can send Discord messages:
// const client = ctx.container.resolve("discordClient");
// await client.channels.get(channelId).send("Hello!");
```

## The Problem: Manual Connection Management

Without services, you'd have to manage connections manually in every action:

```typescript title="manual-connection-nightmare.ts"
// ❌ Without services - repeated connection code everywhere
const sendDiscordMessageAction = action({
  name: "send-discord-message",
  handler: async ({ channelId, message }) => {
    // Create new Discord client every time (slow!)
    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds],
      token: process.env.DISCORD_TOKEN,
    });

    // Connect every time (slow!)
    await client.login();

    // Send message
    await client.channels.get(channelId).send(message);

    // Close connection
    await client.destroy();
  },
});

const banUserAction = action({
  name: "ban-user",
  handler: async ({ userId, guildId }) => {
    // Same connection code repeated (DRY violation!)
    const client = new Discord.Client({
      intents: [Discord.GatewayIntentBits.Guilds],
      token: process.env.DISCORD_TOKEN,
    });

    await client.login(); // Slow reconnection every time!

    const guild = await client.guilds.fetch(guildId);
    await guild.members.ban(userId);

    await client.destroy();
  },
});

// Problems:
// 🐌 Slow - reconnecting for every action
// 🔄 Repetitive - same connection code everywhere
// 💔 Unreliable - connection failures not handled
// 📈 Expensive - multiple connections to same service
```

## The Solution: Services Manage Infrastructure

With services, connections are created once and shared:

```typescript title="clean-service-solution.ts"
// ✅ With services - clean, fast, reliable

// 1. Service handles connection once
const discordService = service({
  name: "discord",
  register: (container) => {
    container.singleton(
      "discordClient",
      () =>
        new Discord.Client({
          intents: [Discord.GatewayIntentBits.Guilds],
          token: process.env.DISCORD_TOKEN,
        })
    );
  },
  boot: async (container) => {
    const client = container.resolve("discordClient");
    await client.login(); // Connect once at startup
  },
});

// 2. Actions just use the shared client
const sendDiscordMessageAction = action({
  name: "send-discord-message",
  handler: async ({ channelId, message }, ctx) => {
    // Get already-connected client (fast!)
    const client = ctx.container.resolve("discordClient");

    // Send message immediately (no connection delay)
    await client.channels.get(channelId).send(message);
  },
});

const banUserAction = action({
  name: "ban-user",
  handler: async ({ userId, guildId }, ctx) => {
    // Same client, no duplication (DRY!)
    const client = ctx.container.resolve("discordClient");

    const guild = await client.guilds.fetch(guildId);
    await guild.members.ban(userId);
  },
});

// Benefits:
// ⚡ Fast - client connected once at startup
// 🔄 DRY - no repeated connection code
// 💪 Reliable - connection managed centrally
// 💰 Efficient - one connection shared across actions
```

## How Services Work: The Container

Services use a **dependency injection container** - think of it like a storage
system for shared resources:

### Container Basics

```typescript title="container-example.ts"
import { createContainer } from "@daydreamsai/core";

const container = createContainer();

// Store things in the container
container.singleton("databaseUrl", () => process.env.DATABASE_URL);
container.singleton("database", (c) => new MongoDB(c.resolve("databaseUrl")));

// Get things from the container
const db = container.resolve("database");
await db.connect();
```

### Container Methods

```typescript title="container-methods.ts"
const container = createContainer();

// singleton() - Create once, reuse everywhere
container.singleton("apiClient", () => new ApiClient());
const client1 = container.resolve("apiClient");
const client2 = container.resolve("apiClient");
// client1 === client2 (same instance)

// register() - Create new instance each time
container.register("requestId", () => Math.random().toString());
const id1 = container.resolve("requestId");
const id2 = container.resolve("requestId");
// id1 !== id2 (different instances)

// instance() - Store pre-created object
const config = { apiKey: "secret123" };
container.instance("config", config);
const retrievedConfig = container.resolve("config");
// retrievedConfig === config (exact same object)

// alias() - Create alternative name
container.alias("db", "database");
const db = container.resolve("db"); // Same as resolve("database")
```

## Service Lifecycle

Services have two phases: **register** (setup) and **boot** (initialize):

```typescript title="service-lifecycle.ts"
const redisService = service({
  name: "redis",

  // Phase 1: REGISTER - Define how to create things
  register: (container) => {
    // Just define the factory functions
    container.singleton("redisConfig", () => ({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
    }));

    container.singleton(
      "redisClient",
      (c) => new Redis(c.resolve("redisConfig"))
    );

    console.log("📝 Redis service registered");
  },

  // Phase 2: BOOT - Actually connect/initialize
  boot: async (container) => {
    // Now connect to Redis
    const client = container.resolve("redisClient");
    await client.connect();

    // Test the connection
    await client.ping();

    console.log("🚀 Redis service booted and connected!");
  },
});

// Lifecycle order:
// 1. All services run register() first
// 2. Then all services run boot()
// 3. This ensures dependencies are available when needed
```

## Real-World Service Examples

### Trading Service

```typescript title="trading-service.ts"
const tradingService = service({
  name: "trading",

  register: (container) => {
    // Register trading client
    container.singleton(
      "alpacaClient",
      () =>
        new Alpaca({
          key: process.env.ALPACA_KEY,
          secret: process.env.ALPACA_SECRET,
          paper: process.env.NODE_ENV !== "production",
        })
    );

    // Register portfolio tracker
    container.singleton(
      "portfolio",
      (c) => new PortfolioTracker(c.resolve("alpacaClient"))
    );

    // Register risk manager
    container.singleton(
      "riskManager",
      () =>
        new RiskManager({
          maxPositionSize: 0.1, // 10% of portfolio
          stopLossPercent: 0.05, // 5% stop loss
        })
    );
  },

  boot: async (container) => {
    // Initialize connections
    const client = container.resolve("alpacaClient");
    await client.authenticate();

    const portfolio = container.resolve("portfolio");
    await portfolio.sync(); // Load current positions

    console.log("💰 Trading service ready!");
  },
});

// Now trading actions can use these:
const buyStockAction = action({
  name: "buy-stock",
  handler: async ({ symbol, quantity }, ctx) => {
    const client = ctx.container.resolve("alpacaClient");
    const riskManager = ctx.container.resolve("riskManager");

    // Check risk before buying
    if (riskManager.canBuy(symbol, quantity)) {
      return await client.createOrder({
        symbol,
        qty: quantity,
        side: "buy",
        type: "market",
      });
    } else {
      throw new Error("Risk limits exceeded");
    }
  },
});
```

### Logging Service

```typescript title="logging-service.ts"
const loggingService = service({
  name: "logging",

  register: (container) => {
    // Different loggers for different purposes
    container.singleton(
      "appLogger",
      () =>
        new Logger({
          level: process.env.LOG_LEVEL || "info",
          format: "json",
          transports: [new FileTransport("app.log"), new ConsoleTransport()],
        })
    );

    container.singleton(
      "actionLogger",
      () =>
        new Logger({
          level: "debug",
          prefix: "[ACTION]",
          transports: [new FileTransport("actions.log")],
        })
    );

    container.singleton(
      "errorLogger",
      () =>
        new Logger({
          level: "error",
          format: "detailed",
          transports: [
            new FileTransport("errors.log"),
            new SlackTransport(process.env.SLACK_WEBHOOK),
          ],
        })
    );
  },

  boot: async (container) => {
    const appLogger = container.resolve("appLogger");
    appLogger.info("🚀 Application starting up");
  },
});

// Actions can use appropriate logger:
const dangerousAction = action({
  name: "delete-user",
  handler: async ({ userId }, ctx) => {
    const actionLogger = ctx.container.resolve("actionLogger");
    const errorLogger = ctx.container.resolve("errorLogger");

    try {
      actionLogger.info(`Attempting to delete user ${userId}`);

      // ... deletion logic ...

      actionLogger.info(`Successfully deleted user ${userId}`);
    } catch (error) {
      errorLogger.error(`Failed to delete user ${userId}`, error);
      throw error;
    }
  },
});
```

## Service Dependencies

Services can depend on other services:

```typescript title="service-dependencies.ts"
// Base database service
const databaseService = service({
  name: "database",
  register: (container) => {
    container.singleton("db", () => new MongoDB(process.env.DB_URI));
  },
  boot: async (container) => {
    const db = container.resolve("db");
    await db.connect();
  },
});

// Cache service that depends on database
const cacheService = service({
  name: "cache",
  register: (container) => {
    // Redis for fast cache
    container.singleton("redis", () => new Redis(process.env.REDIS_URL));

    // Cache manager that uses both Redis and MongoDB
    container.singleton(
      "cacheManager",
      (c) =>
        new CacheManager({
          fastCache: c.resolve("redis"), // From this service
          slowCache: c.resolve("db"), // From database service
          ttl: 3600, // 1 hour
        })
    );
  },

  boot: async (container) => {
    const redis = container.resolve("redis");
    await redis.connect();

    const cacheManager = container.resolve("cacheManager");
    await cacheManager.initialize();

    console.log("💾 Cache service ready!");
  },
});

// Extensions can use both services
const dataExtension = extension({
  name: "data",
  services: [databaseService, cacheService], // Order doesn't matter

  actions: [
    action({
      name: "get-user",
      handler: async ({ userId }, ctx) => {
        const cache = ctx.container.resolve("cacheManager");

        // Try cache first
        let user = await cache.get(`user:${userId}`);

        if (!user) {
          // Cache miss - get from database
          const db = ctx.container.resolve("db");
          user = await db.collection("users").findOne({ _id: userId });

          // Store in cache for next time
          await cache.set(`user:${userId}`, user);
        }

        return user;
      },
    }),
  ],
});
```

## Advanced Patterns

### Environment-Based Services

```typescript title="environment-services.ts"
const storageService = service({
  name: "storage",
  register: (container) => {
    if (process.env.NODE_ENV === "production") {
      // Production: Use S3
      container.singleton(
        "storage",
        () =>
          new S3Storage({
            bucket: process.env.S3_BUCKET,
            region: process.env.AWS_REGION,
          })
      );
    } else {
      // Development: Use local filesystem
      container.singleton(
        "storage",
        () => new LocalStorage({ path: "./uploads" })
      );
    }
  },

  boot: async (container) => {
    const storage = container.resolve("storage");
    await storage.initialize();

    if (process.env.NODE_ENV === "production") {
      console.log("☁️ S3 storage ready");
    } else {
      console.log("📁 Local storage ready");
    }
  },
});
```

### Service Configuration

```typescript title="service-configuration.ts"
const notificationService = service({
  name: "notifications",
  register: (container) => {
    // Configuration
    container.singleton("notificationConfig", () => ({
      slack: {
        webhook: process.env.SLACK_WEBHOOK,
        channel: process.env.SLACK_CHANNEL || "#alerts",
      },
      email: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
        from: process.env.EMAIL_FROM,
      },
      discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK,
      },
    }));

    // Notification clients
    container.singleton("slackNotifier", (c) => {
      const config = c.resolve("notificationConfig");
      return new SlackNotifier(config.slack);
    });

    container.singleton("emailNotifier", (c) => {
      const config = c.resolve("notificationConfig");
      return new EmailNotifier(config.email);
    });

    container.singleton("discordNotifier", (c) => {
      const config = c.resolve("notificationConfig");
      return new DiscordNotifier(config.discord);
    });

    // Unified notification manager
    container.singleton(
      "notificationManager",
      (c) =>
        new NotificationManager({
          slack: c.resolve("slackNotifier"),
          email: c.resolve("emailNotifier"),
          discord: c.resolve("discordNotifier"),
        })
    );
  },

  boot: async (container) => {
    const manager = container.resolve("notificationManager");
    await manager.testConnections();
    console.log("📢 Notification service ready!");
  },
});
```

## Best Practices

### 1. Single Responsibility

```typescript title="single-responsibility.ts"
// ✅ Good - each service handles one thing
const databaseService = service({
  name: "database",
  // Only database connection management
});

const cacheService = service({
  name: "cache",
  // Only caching functionality
});

const loggingService = service({
  name: "logging",
  // Only logging configuration
});

// ❌ Bad - one service doing everything
const everythingService = service({
  name: "everything",
  register: (container) => {
    // Database + cache + logging + API clients + notifications...
    // Too many responsibilities!
  },
});
```

### 2. Clear Dependencies

```typescript title="clear-dependencies.ts"
// ✅ Good - clear what this service provides
const authService = service({
  name: "auth",
  register: (container) => {
    container.singleton("jwtSecret", () => process.env.JWT_SECRET);
    container.singleton(
      "tokenManager",
      (c) => new TokenManager(c.resolve("jwtSecret"))
    );
    container.singleton(
      "userAuthenticator",
      (c) =>
        new UserAuthenticator({
          tokenManager: c.resolve("tokenManager"),
          database: c.resolve("db"), // Depends on database service
        })
    );
  },
});

// ❌ Bad - unclear what's provided
const helperService = service({
  name: "helper",
  register: (container) => {
    container.singleton("stuff", () => new Thing());
    container.singleton("helper", () => new Helper());
    // What do these do? How do they relate?
  },
});
```

### 3. Graceful Error Handling

```typescript title="error-handling.ts"
const apiService = service({
  name: "external-api",
  register: (container) => {
    container.singleton(
      "apiClient",
      () =>
        new ApiClient({
          baseUrl: process.env.API_URL,
          apiKey: process.env.API_KEY,
          timeout: 10000,
          retries: 3,
        })
    );
  },

  boot: async (container) => {
    try {
      const client = container.resolve("apiClient");
      await client.healthCheck();
      console.log("✅ External API connection verified");
    } catch (error) {
      console.error("❌ External API connection failed:", error.message);

      // Don't crash the agent - just log the error
      // Actions can handle API unavailability gracefully
      console.warn(
        "⚠️ Agent will start but external API features may be limited"
      );
    }
  },
});
```

### 4. Resource Cleanup

```typescript title="resource-cleanup.ts"
const databaseService = service({
  name: "database",
  register: (container) => {
    container.singleton("db", () => {
      const db = new MongoDB(process.env.DB_URI);

      // Register cleanup when process exits
      process.on("SIGINT", async () => {
        console.log("🔄 Closing database connection...");
        await db.close();
        console.log("✅ Database connection closed");
        process.exit(0);
      });

      return db;
    });
  },

  boot: async (container) => {
    const db = container.resolve("db");
    await db.connect();
  },
});
```

## Troubleshooting

### Missing Dependencies

```typescript title="missing-dependency-error.ts"
// Error: "Token 'databaseClient' not found in container"

// ❌ Problem - trying to resolve unregistered token
const action = action({
  handler: async (args, ctx) => {
    const db = ctx.container.resolve("databaseClient"); // Not registered!
  },
});

// ✅ Solution - ensure service registers the token
const databaseService = service({
  register: (container) => {
    container.singleton("databaseClient", () => new Database());
    //                  ^^^^^^^^^^^^^^ Must match resolve token
  },
});
```

### Circular Dependencies

```typescript title="circular-dependency-fix.ts"
// ❌ Problem - services depending on each other
const serviceA = service({
  register: (container) => {
    container.singleton("a", (c) => new A(c.resolve("b"))); // Needs B
  },
});

const serviceB = service({
  register: (container) => {
    container.singleton("b", (c) => new B(c.resolve("a"))); // Needs A
  },
});

// ✅ Solution - introduce a coordinator service
const coordinatorService = service({
  register: (container) => {
    container.singleton("a", () => new A());
    container.singleton("b", () => new B());
    container.singleton(
      "coordinator",
      (c) => new Coordinator(c.resolve("a"), c.resolve("b"))
    );
  },

  boot: async (container) => {
    const coordinator = container.resolve("coordinator");
    coordinator.wireComponents(); // Set up relationships after creation
  },
});
```

## Next Steps

* **[Extensions vs Services](/docs/core/advanced/extensions-vs-services)** -
  When to use services vs extensions
* **[Extensions Guide](/docs/core/advanced/extensions)** - Build complete
  feature packages
* **[Built-in Services](/docs/tutorials/examples)** - See real service examples

## Key Takeaways

* **Services manage infrastructure** - Database connections, API clients,
  utilities
* **Container provides shared access** - One connection used by all actions
* **Two-phase lifecycle** - Register (setup) then boot (initialize)
* **Dependency injection** - Components don't create their own dependencies
* **Clean separation** - Infrastructure separate from business logic

Services let you build reliable agents with proper resource management and clean
architecture.


file: ./content/docs/core/advanced/supabase.mdx
meta: {
  "title": "Supabase",
  "description": "This guide will walk you through creating an AI agent that utilizes supabase as the memory store."
}
        
## Using Supabase with Daydreams

Setup Info:

* Vector Model Provider: `gpt-4-turbo` via `@ai-sdk/openai`
* Model Provider: `google/gemini-2.0-flash-001` via
  `@openrouter/ai-sdk-provider`
* Memory Store: Supabase via `@daydreamsai/supabase`
* Communication method: Command Line via `@daydreamsai/cli`

Initialize a project and add our setup packages

```bash
bun init
bun add @daydreamsai/core @daydreamsai/supabase @daydreamsai/cli @ai-sdk/openai @openrouter/ai-sdk-provider
```

After installing the packages, go to
[https://supabase.com/](https://supabase.com/) and create a new project. Once
your project is created, you'll need to add the two environment variables
necessary for this package to your environment.

```bash
# Supabase
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_KEY

# Other variables used in this example
OPENROUTER_API_KEY=YOUR_SUPABASE_SERVICE_KEY
OPENAI_API_KEY=YOUR_OPENAI_KEY
OPENROUTER_API_KEY=YOUR_OPENROUTER_KEY
```

These variables are provided by Supabase when you create the project and can be
found in your project settings:Data API.

Next, you need to set up the necessary database structure for the agent's
memory. Copy the following SQL code block and paste in the Supabase SQL Editor
(found in the sidebar):

```sql
-- Enable the pgvector extension if it's not already enabled
-- This is crucial for vector similarity search used by SupabaseVectorStore
CREATE EXTENSION IF NOT EXISTS vector;

-- Function to enable pgvector extension (might be used internally by SupabaseVectorStore)
CREATE OR REPLACE FUNCTION enable_pgvector_extension()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
END;
$$;

-- Function to execute arbitrary SQL (potentially used by SupabaseVectorStore for initialization)
-- SECURITY DEFINER allows the function to run with the privileges of the user who defines it,
-- necessary for operations like creating tables or extensions if the calling user doesn't have direct permissions.
-- Ensure you understand the security implications before using SECURITY DEFINER.
CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;
```

Afterards you should see a success message like "Success. No rows returned".

With the Supabase setup complete, let's create the agent in our `index.ts`:

```ts
// This example shows how to use Supabase with DaydreamsAI.

// Vector Model Provider: gpt-4-turbo                    via @ai-sdk/openai
// Model Provider:        google/gemini-2.0-flash-001    via @openrouter/ai-sdk-provider
// Memory Store:          @daydreamsai/supabase
// CLI Extension:         @daydreamsai/cli

import { openai } from "@ai-sdk/openai";
import {
  createContainer,
  createDreams,
  Logger,
  LogLevel,
  validateEnv,
} from "@daydreamsai/core";
import { createSupabaseBaseMemory } from "@daydreamsai/supabase";
import { z } from "zod";
import { cliExtension } from "@daydreamsai/cli";
import { openrouter } from "@openrouter/ai-sdk-provider";

validateEnv(
  z.object({
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    SUPABASE_URL: z.string().min(1, "SUPABASE_URL is required"),
    SUPABASE_SERVICE_KEY: z.string().min(1, "SUPABASE_SERVICE_KEY is required"),
  })
);

const agent = createDreams({
  container: createContainer(),
  logger: new Logger({ level: LogLevel.DEBUG }),
  model: openrouter("google/gemini-2.0-flash-001"),
  extensions: [cliExtension],
  memory: createSupabaseBaseMemory({
    url: process.env.SUPABASE_URL!,
    key: process.env.SUPABASE_SERVICE_KEY!,
    memoryTableName: "agent",
    vectorTableName: "agentVectors",
    vectorModel: openai("gpt-4-turbo"),
  }),
});

// Agent starts
await agent.start();
```

Run the agent and chat via the command line interface!

```
bun run index.ts
```


file: ./content/docs/core/concepts/actions.mdx
meta: {
  "title": "Actions",
  "description": "Define capabilities and interactions for your Daydreams agent."
}
        
## What is an Action?

An action is something your agent can **do** - like calling an API, saving data,
or performing calculations. Think of actions as giving your agent superpowers.

## Real Examples

Here are actions that make agents useful:

### Weather Action

```typescript title="weather-action.ts"
// Agent can check weather
const getWeather = action({
  name: "get-weather",
  description: "Gets current weather for a city",
  schema: z.object({
    city: z.string(),
  }),
  handler: async ({ city }) => {
    const response = await fetch(`https://api.weather.com/${city}`);
    return await response.json(); // { temperature: "72°F", condition: "sunny" }
  },
});
```

### Database Action

```typescript title="database-action.ts"
// Agent can save user preferences
const savePreference = action({
  name: "save-preference",
  description: "Saves a user preference",
  schema: z.object({
    userId: z.string(),
    key: z.string(),
    value: z.string(),
  }),
  handler: async ({ userId, key, value }) => {
    await database.save(userId, key, value);
    return { success: true, message: "Preference saved!" };
  },
});
```

### Email Action

```typescript title="email-action.ts"
// Agent can send emails
const sendEmail = action({
  name: "send-email",
  description: "Sends an email to a user",
  schema: z.object({
    to: z.string(),
    subject: z.string(),
    body: z.string(),
  }),
  handler: async ({ to, subject, body }) => {
    await emailService.send({ to, subject, body });
    return { sent: true, timestamp: new Date().toISOString() };
  },
});
```

## The Problem Without Actions

Without actions, your agent can only **talk**:

```text title="limited-agent.txt"
User: "What's the weather in Boston?"
Agent: "I don't have access to weather data, but I imagine it might be nice!"
// ❌ Can't actually check weather
// ❌ Just makes stuff up
// ❌ Not helpful
```

## The Solution: Actions Give Agents Capabilities

With actions, your agent can **do things**:

```text title="capable-agent.txt"
User: "What's the weather in Boston?"
Agent: *calls getWeather action*
Agent: "It's 65°F and cloudy in Boston right now!"
// ✅ Actually checks real weather API
// ✅ Provides accurate information
// ✅ Actually useful
```

## How Actions Work in Your Agent

### 1. You Define What the Agent Can Do

```typescript title="define-actions.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  actions: [
    getWeather, // Agent can check weather
    savePreference, // Agent can save user data
    sendEmail, // Agent can send emails
  ],
});
```

### 2. The LLM Decides When to Use Them

When the agent thinks, it sees:

```text title="llm-prompt.txt"
Available actions:
- get-weather: Gets current weather for a city
- save-preference: Saves a user preference
- send-email: Sends an email to a user

User message: "Check weather in NYC and email it to john@example.com"
```

### 3. The LLM Calls Actions

The LLM responds with structured calls:

```xml title="llm-response.xml"
<response>
  <reasoning>I need to check weather first, then email the results</reasoning>

  <action_call name="get-weather">{"city": "NYC"}</action_call>
  <action_call name="send-email">{
    "to": "john@example.com",
    "subject": "NYC Weather",
    "body": "Current weather: {{calls[0].temperature}}, {{calls[0].condition}}"
  }</action_call>
</response>
```

### 4. Daydreams Executes Your Code

Daydreams automatically:

* Validates the arguments against your schema
* Runs your handler function
* Returns results to the LLM
* Handles errors gracefully

## Creating Your First Action

Here's a simple action that adds two numbers:

```typescript title="calculator-action.ts"
import { action } from "@daydreamsai/core";
import { z } from "zod";

export const addNumbers = action({
  // Name the LLM uses to call this action
  name: "add-numbers",

  // Description helps LLM know when to use it
  description: "Adds two numbers together",

  // Schema defines what arguments are required
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),

  // Handler is your actual code that runs
  handler: async ({ a, b }) => {
    const result = a + b;
    return {
      sum: result,
      message: `${a} + ${b} = ${result}`,
    };
  },
});
```

Use it in your agent:

```typescript title="agent-with-calculator.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  actions: [addNumbers],
});

// Now when user asks "What's 5 + 3?", the agent will:
// 1. Call addNumbers action with {a: 5, b: 3}
// 2. Get back {sum: 8, message: "5 + 3 = 8"}
// 3. Respond: "5 + 3 = 8"
```

## Working with State and Memory

Actions can read and modify your agent's memory:

```typescript title="todo-actions.ts"
// Define what your context remembers
interface TodoMemory {
  tasks: { id: string; title: string; done: boolean }[];
}

const addTask = action({
  name: "add-task",
  description: "Adds a new task to the todo list",
  schema: z.object({
    title: z.string().describe("What the task is"),
  }),
  handler: async ({ title }, ctx) => {
    // Access context memory (automatically typed!)
    const memory = ctx.memory as TodoMemory;

    // Initialize if needed
    if (!memory.tasks) {
      memory.tasks = [];
    }

    // Add new task
    const newTask = {
      id: crypto.randomUUID(),
      title,
      done: false,
    };

    memory.tasks.push(newTask);

    // Changes are automatically saved
    return {
      success: true,
      taskId: newTask.id,
      message: `Added "${title}" to your todo list`,
    };
  },
});

const completeTask = action({
  name: "complete-task",
  description: "Marks a task as completed",
  schema: z.object({
    taskId: z.string().describe("ID of task to complete"),
  }),
  handler: async ({ taskId }, ctx) => {
    const memory = ctx.memory as TodoMemory;

    const task = memory.tasks?.find((t) => t.id === taskId);
    if (!task) {
      return { success: false, message: "Task not found" };
    }

    task.done = true;

    return {
      success: true,
      message: `Completed "${task.title}"`,
    };
  },
});
```

Now your agent can manage todo lists across conversations!

## External API Integration

Actions are perfect for calling external APIs:

```typescript title="external-api-action.ts"
const searchWikipedia = action({
  name: "search-wikipedia",
  description: "Searches Wikipedia for information",
  schema: z.object({
    query: z.string().describe("What to search for"),
    limit: z.number().optional().default(3).describe("Max results"),
  }),
  handler: async ({ query, limit }) => {
    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/search?q=${encodeURIComponent(
          query
        )}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        results: data.pages.map((page) => ({
          title: page.title,
          description: page.description,
          url: `https://en.wikipedia.org/wiki/${page.key}`,
        })),
        message: `Found ${data.pages.length} results for "${query}"`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to search Wikipedia for "${query}"`,
      };
    }
  },
});
```

## Best Practices

### 1. Use Clear Names and Descriptions

```typescript title="good-naming.ts"
// ✅ Good - clear what it does
const getUserProfile = action({
  name: "get-user-profile",
  description: "Gets detailed profile information for a user by their ID",
  // ...
});

// ❌ Bad - unclear purpose
const doStuff = action({
  name: "do-stuff",
  description: "Does some user stuff",
  // ...
});
```

### 2. Validate Input with Schemas

```typescript title="good-validation.ts"
// ✅ Good - specific validation
schema: z.object({
  email: z.string().email().describe("User's email address"),
  age: z.number().min(0).max(150).describe("User's age in years"),
  preferences: z
    .array(z.string())
    .optional()
    .describe("List of user preferences"),
});

// ❌ Bad - too loose
schema: z.object({
  data: z.any(),
});
```

### 3. Handle Errors Gracefully

```typescript title="error-handling.ts"
handler: async ({ userId }) => {
  try {
    const user = await database.getUser(userId);
    return { success: true, user };
  } catch (error) {
    // Log the error for debugging
    console.error("Failed to get user:", error);

    // Return structured error for the LLM
    return {
      success: false,
      error: "User not found",
      message: `Could not find user with ID ${userId}`,
    };
  }
};
```

### 4. Use async/await for I/O Operations

```typescript title="async-best-practice.ts"
// ✅ Good - properly handles async
handler: async ({ url }) => {
  const response = await fetch(url);
  const data = await response.json();
  return { data };
};

// ❌ Bad - doesn't wait for async operations
handler: ({ url }) => {
  fetch(url); // This returns a Promise that's ignored!
  return { status: "done" }; // Completes before fetch finishes
};
```

### 5. Check for Cancellation in Long Operations

```typescript title="cancellation-handling.ts"
handler: async ({ items }, ctx) => {
  for (let i = 0; i < items.length; i++) {
    // Check if the agent wants to cancel
    if (ctx.abortSignal?.aborted) {
      throw new Error("Operation cancelled");
    }

    await processItem(items[i]);
  }

  return { processed: items.length };
};
```

## Advanced: Context-Specific Actions

You can attach actions to specific contexts so they're only available in certain
situations:

```typescript title="context-specific.ts"
const chatContext = context({
  type: "chat",
  schema: z.object({ userId: z.string() }),
  create: () => ({ messages: [] }),
}).setActions([
  // These actions only available during chat
  action({
    name: "save-chat-preference",
    description: "Saves a preference for this chat user",
    schema: z.object({
      key: z.string(),
      value: z.string(),
    }),
    handler: async ({ key, value }, ctx) => {
      // ctx.memory is automatically typed as chat memory
      if (!ctx.memory.userPreferences) {
        ctx.memory.userPreferences = {};
      }
      ctx.memory.userPreferences[key] = value;
      return { saved: true };
    },
  }),
]);
```

## Key Takeaways

* **Actions give agents capabilities** - They can do things, not just talk
* **LLM chooses when to use them** - Based on names and descriptions you provide
* **Arguments are validated** - Zod schemas ensure type safety
* **State persists automatically** - Changes to memory are saved
* **Error handling is crucial** - Return structured success/error responses
* **async/await required** - For any I/O operations like API calls

Actions transform your agent from a chatbot into a capable assistant that can
actually get things done.


file: ./content/docs/core/concepts/agent-lifecycle.mdx
meta: {
  "title": "Agent Lifecycle",
  "description": "How Daydreams agents process information and execute tasks."
}
        
## Simple Overview

Think of an agent as following a simple loop:

1. **Something happens** (input arrives)
2. **Agent thinks** (uses LLM to decide what to do)
3. **Agent acts** (performs actions or sends responses)
4. **Agent remembers** (saves what happened)
5. **Repeat**

This loop continues as long as the agent is running, handling new inputs and
responding intelligently based on its context and memory.

## The Basic Flow

Here's what happens when your agent receives a Discord message:

```
Discord Message Arrives
         ↓
Agent loads chat context & memory
         ↓
Agent thinks: "What should I do?"
         ↓
Agent decides: "I'll check the weather and respond"
         ↓
Agent calls weather API (action)
         ↓
Agent sends Discord reply (output)
         ↓
Agent saves conversation to memory
```

***

## Detailed Technical Explanation

The core of the Daydreams framework is the agent's execution lifecycle. This
loop manages how an agent receives input, reasons with an LLM, performs actions,
and handles results. Understanding this flow is crucial for building and
debugging agents.

Let's trace the lifecycle of a typical request:

## 1. Input Reception

* **Source:** An external system (like Discord, Telegram, CLI, or an API) sends
  information to the agent. This is usually configured via an `extension`.
* **Listener:** An `input` definition within the agent or an extension listens
  for these events (e.g., a new message arrives).
* **Trigger:** When the external event occurs, the input listener is triggered.
* **Invocation:** The listener typically calls `agent.send(...)`, providing:
  * The target `context` definition (which part of the agent should handle
    this?).
  * `args` to identify the specific context instance (e.g., which chat
    session?).
  * The input `data` itself (e.g., the message content).

## 2. `agent.send` - Starting the Process

* **Log Input:** The framework logs the incoming information as an `InputRef` (a
  record of the input).
* **Initiate Run:** It then calls the internal `agent.run` method to start or
  continue the processing cycle for the specified context instance, passing the
  new `InputRef` along.

## 3. `agent.run` - Managing the Execution Cycle

* **Load/Create Context:** The framework finds the specific `ContextState` for
  the target instance (e.g., the state for chat session #123). If it's the first
  time interacting with this instance, it creates the state and its associated
  persistent memory (`ContextState.memory`). It also retrieves or creates the
  temporary `WorkingMemory` for this specific run.
* **Handle Concurrency:** It checks if this context instance is already
  processing another request. If so, the new input is usually added to the
  ongoing run. If not, it sets up a new run.
* **Setup Run Environment:** It prepares the environment for the LLM
  interaction, gathering all available `actions`, `outputs`, and relevant
  context information.
* **Start Step Loop:** It begins the main processing loop, which iterates
  through one or more reasoning steps until the interaction is complete.

## 4. Inside the Step Loop - Perception, Reasoning, Action

Each iteration (step) within the `agent.run` loop represents one turn of the
agent's core reasoning cycle:

* **Prepare State:** The agent gathers the latest information, including:
  * The current persistent state of the active `Context`(s) (via their `render`
    functions).
  * The history of the current interaction from `WorkingMemory` (processed
    inputs, outputs, action results from previous steps).
  - Any *new* unprocessed information (like the initial `InputRef` or results
    from actions completed in the previous step).
  - The list of currently available `actions` and `outputs`.
* **Generate Prompt:** This information is formatted into a structured prompt
  (using XML) for the LLM. The prompt clearly tells the LLM its instructions,
  what tools (actions/outputs) it has, the current state, and what new
  information needs attention. (See [Prompting](/docs/core/concepts/prompting)).
* **LLM Call:** The agent sends the complete prompt to the configured LLM.
* **Process LLM Response Stream:** As the LLM generates its response token by
  token:
  * The framework **streams** the response.
  * It **parses** the stream, looking for specific XML tags defined in the
    expected response structure (`<reasoning>`, `<action_call>`, `<output>`).
  * The LLM's thought process is extracted from `<reasoning>` tags and logged.
  * Instructions to perform actions (`<action_call>`) or send outputs
    (`<output>`) are identified.
* **Execute Actions & Outputs:**
  * For each identified `<action_call>`, the framework validates the arguments
    against the action's schema and schedules the action's `handler` function to
    run via the `TaskRunner`. (See [Actions](/docs/core/concepts/actions) and
    [Tasks](/docs/core/concepts/tasks)).
  - For each identified `<output>`, the framework validates the
    content/attributes and runs the output's `handler` function to send the
    information externally (e.g., post a message). (See
    [Outputs](/docs/core/concepts/outputs)).
* **Wait for Actions:** The agent waits for any critical asynchronous actions
  scheduled in this step to complete. Their results (`ActionResult`) are logged
  to `WorkingMemory`.
* **Check Completion:** The agent determines if the interaction is complete or
  if another reasoning step (another loop iteration) is needed based on defined
  conditions (`shouldContinue` hooks or remaining unprocessed logs).

## 5. Run Completion

* **Exit Loop:** Once the loop condition determines no further steps are needed,
  the loop exits.
* **Final Tasks:** Any final cleanup logic or `onRun` hooks defined in the
  context are executed.
* **Save State:** The final persistent state (`ContextState.memory`) of all
  involved contexts is saved to the `MemoryStore`.
* **Return Results:** The framework resolves the promise originally returned by
  `agent.send` or `agent.run`, providing the complete log (`chain`) of the
  interaction.

This detailed cycle illustrates how Daydreams agents iteratively perceive
(inputs, results), reason (LLM prompt/response), and act (outputs, actions),
using streaming and asynchronous task management to handle potentially complex
interactions efficiently.


file: ./content/docs/core/concepts/building-blocks.mdx
meta: {
  "title": "Building Blocks",
  "description": "The core components that make up a Daydreams agent."
}
        
Every Daydreams agent is built from four main building blocks. Think of them as
the essential parts that work together to create intelligent behavior.

## The Four Building Blocks

### 1. Inputs - How Your Agent Listens

Inputs are how your agent receives information from the outside world.

```typescript title="input-example.ts"
// Listen for Discord messages
const discordMessage = input({
  name: "discord-message",
  description: "Receives messages from Discord",
  // When a message arrives, this triggers the agent
});
```

**Examples:**

* A Discord message arrives
* A user types in the CLI
* An API webhook gets called
* A timer goes off

### 2. Outputs - How Your Agent Speaks

Outputs are how your agent sends information back to the world.

```typescript title="output-example.ts"
// Send a Discord message
const discordReply = output({
  name: "discord-reply",
  description: "Sends a message to Discord",
  // The agent can call this to respond
});
```

**Examples:**

* Posting a message to Discord
* Printing to the console
* Sending an email
* Making an API call

### 3. Actions - What Your Agent Can Do

Actions are tasks your agent can perform to interact with systems or gather
information.

```typescript title="action-example.ts"
// Check the weather
const getWeather = action({
  name: "get-weather",
  description: "Gets current weather for a location",
  schema: z.object({
    location: z.string(),
  }),
  handler: async ({ location }) => {
    // Call weather API and return result
    return { temperature: "72°F", condition: "sunny" };
  },
});
```

**Examples:**

* Calling a weather API
* Reading from a database
* Processing a file
* Making calculations

### 4. Contexts - Your Agent's Workspace

Contexts define different "workspaces" or "modes" for your agent. Each context
has its own memory and behavior.

```typescript title="context-example.ts"
// A chat session context
const chatContext = context({
  type: "chat",
  schema: z.object({
    userId: z.string(),
  }),
  // This context remembers chat history
  create: () => ({
    messages: [],
    userPreferences: {},
  }),
});
```

**Examples:**

* A chat session with a specific user
* Playing a specific game
* Processing a specific document
* Managing a specific project

## How They Work Together

Here's a simple flow showing how these building blocks connect:

1. **Input arrives** → "New Discord message from user123"
2. **Agent thinks** → "I should respond helpfully in this chat context"
3. **Agent acts** → Calls the `getWeather` action if needed
4. **Agent responds** → Uses an output to send a reply
5. **Context remembers** → Saves the conversation in chat context memory

## The React Mental Model

If you know React, think of it this way:

* **Contexts** = React components (manage state and behavior)
* **Actions** = Event handlers (respond to interactions)
* **Inputs/Outputs** = Props/callbacks (data in and out)
* **Agent** = React app (orchestrates everything)

## Next Steps

Now that you understand the building blocks, you can dive deeper into each one:

* **[Contexts](/docs/core/concepts/contexts)** - Learn how to manage state and
  memory
* **[Inputs](/docs/core/concepts/inputs)** - Set up ways for your agent to
  receive information
* **[Outputs](/docs/core/concepts/outputs)** - Configure how your agent responds
* **[Actions](/docs/core/concepts/actions)** - Define what your agent can do
* **[Agent Lifecycle](/docs/core/concepts/agent-lifecycle)** - Understand the
  complete execution flow


file: ./content/docs/core/concepts/contexts.mdx
meta: {
  "title": "Contexts",
  "description": "Managing state, memory, and behavior for agent interactions."
}
        
## What is a Context?

A context is like a **separate workspace** for your agent. Think of it like
having different tabs open in your browser - each tab has its own state and
remembers different things.

## Real Examples

Here are contexts that make agents stateful:

### Chat Context

```typescript title="chat-context.ts"
// Each user gets their own chat workspace
const chatContext = context({
  type: "chat",
  schema: z.object({
    userId: z.string(),
  }),
  create: () => ({
    messages: [],
    userPreferences: {},
    lastSeen: null,
  }),
  render: (state) => `
    Chat with ${state.args.userId}
    Recent messages: ${state.memory.messages.slice(-3).join("\n")}
  `,
});
```

### Game Context

```typescript title="game-context.ts"
// Each game session has its own state
const gameContext = context({
  type: "game",
  schema: z.object({
    gameId: z.string(),
  }),
  create: () => ({
    playerHealth: 100,
    level: 1,
    inventory: [],
    currentRoom: "start",
  }),
  render: (state) => `
    Game: ${state.args.gameId}
    Health: ${state.memory.playerHealth}
    Level: ${state.memory.level}
    Room: ${state.memory.currentRoom}
  `,
});
```

### Project Context

```typescript title="project-context.ts"
// Each project tracks its own progress
const projectContext = context({
  type: "project",
  schema: z.object({
    projectId: z.string(),
  }),
  create: () => ({
    tasks: [],
    status: "planning",
    teamMembers: [],
    deadlines: [],
  }),
  render: (state) => `
    Project: ${state.args.projectId}
    Status: ${state.memory.status}
    Tasks: ${state.memory.tasks.length} total
  `,
});
```

## The Problem: Agents Need to Remember Different Things

Without contexts, your agent mixes everything together:

```text title="confused-agent.txt"
User Alice: "My favorite color is blue"
User Bob: "What's Alice's favorite color?"
Agent: "Alice's favorite color is blue"
// ❌ Bob shouldn't see Alice's private info!

User in Game A: "Go north"
User in Game B: "What room am I in?"
Agent: "You went north" (from Game A!)
// ❌ Wrong game state mixed up!

Project Alpha discussion mixed with Project Beta tasks
// ❌ Complete chaos!
```

## The Solution: Contexts Separate Everything

With contexts, each conversation/session/game stays separate:

```text title="organized-agent.txt"
Alice's Chat Context:
- Alice: "My favorite color is blue"
- Agent remembers: Alice likes blue

Bob's Chat Context:
- Bob: "What's Alice's favorite color?"
- Agent: "I don't have information about Alice"
// ✅ Privacy maintained!

Game A Context:
- Player went north → remembers current room

Game B Context:
- Separate game state → different room
// ✅ No mixing of game states!
```

## How Contexts Work in Your Agent

### 1. You Define Different Context Types

```typescript title="define-contexts.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  contexts: [
    chatContext, // For user conversations
    gameContext, // For game sessions
    projectContext, // For project management
  ],
});
```

### 2. Inputs Route to Specific Context Instances

```typescript title="context-routing.ts"
// Discord input routes to chat contexts
discordInput.subscribe((send, agent) => {
  discord.on("message", (msg) => {
    // Each user gets their own chat context instance
    send(
      chatContext,
      { userId: msg.author.id },
      {
        content: msg.content,
      }
    );
  });
});

// Game input routes to game contexts
gameInput.subscribe((send, agent) => {
  gameServer.on("move", (event) => {
    // Each game gets its own context instance
    send(
      gameContext,
      { gameId: event.gameId },
      {
        action: event.action,
      }
    );
  });
});
```

### 3. Agent Maintains Separate Memory

```text title="context-instances.txt"
Chat Context Instances:
- chat:alice → { messages: [...], preferences: {...} }
- chat:bob   → { messages: [...], preferences: {...} }
- chat:carol → { messages: [...], preferences: {...} }

Game Context Instances:
- game:session1 → { health: 80, level: 3, room: "forest" }
- game:session2 → { health: 100, level: 1, room: "start" }
- game:session3 → { health: 45, level: 7, room: "dungeon" }

All completely separate!
```

## Creating Your First Context

Here's a simple todo list context:

```typescript title="todo-context.ts"
import { context } from "@daydreamsai/core";
import { z } from "zod";

// Define what this context remembers
interface TodoMemory {
  tasks: { id: string; title: string; done: boolean }[];
  createdAt: string;
}

export const todoContext = context<TodoMemory>({
  // Type identifies this kind of context
  type: "todo",

  // Schema defines how to identify specific instances
  schema: z.object({
    listId: z.string().describe("Unique ID for this todo list"),
  }),

  // Create initial memory when first accessed
  create: () => ({
    tasks: [],
    createdAt: new Date().toISOString(),
  }),

  // How this context appears to the LLM
  render: (state) => {
    const { tasks } = state.memory;
    const pending = tasks.filter((t) => !t.done).length;
    const completed = tasks.filter((t) => t.done).length;

    return `
Todo List: ${state.args.listId}
Tasks: ${pending} pending, ${completed} completed

Recent tasks:
${tasks
  .slice(-5)
  .map((t) => `${t.done ? "✅" : "⏳"} ${t.title}`)
  .join("\n")}
    `;
  },

  // Instructions for the LLM when this context is active
  instructions:
    "Help the user manage their todo list. You can add, complete, and list tasks.",
});
```

Use it in your agent:

```typescript title="agent-with-todo.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  contexts: [todoContext],
});

// Now users can have separate todo lists:
// todo:work → Work tasks
// todo:personal → Personal tasks
// todo:shopping → Shopping list
// Each maintains separate state!
```

## Context Memory: What Gets Remembered

Context memory persists between conversations:

```typescript title="memory-example.ts"
// First conversation
User: "Add 'buy milk' to my shopping list"
Agent: → todoContext(listId: "shopping")
       → memory.tasks.push({id: "1", title: "buy milk", done: false})
       → "Added 'buy milk' to your shopping list"

// Later conversation (hours/days later)
User: "What's on my shopping list?"
Agent: → todoContext(listId: "shopping")
       → Loads saved memory: {tasks: [{title: "buy milk", done: false}]}
       → "You have 'buy milk' on your shopping list"

// ✅ Context remembered the task across conversations!
```

## Multiple Contexts in One Agent

Your agent can switch between different contexts:

```xml title="context-switching.xml"
<!-- User starts in chat context -->
<input type="discord:message" userId="alice">
  "Add 'finish project' to my work todo list"
</input>

<!-- Agent recognizes this needs todo context -->
<response>
  <reasoning>User wants to add a task to their work todo list. I should use the todo context.</reasoning>

  <!-- Switch to todo context -->
  <action_call name="add-task" context="todo" args='{"listId": "work"}'>
    {"title": "finish project"}
  </action_call>

  <!-- Respond back in chat context -->
  <output type="discord:message" channelId="123">
    Added "finish project" to your work todo list!
  </output>
</response>
```

## Advanced: Context-Specific Actions

You can attach actions that only work in certain contexts:

```typescript title="context-specific-actions.ts"
const todoContextWithActions = todoContext.setActions([
  action({
    name: "add-task",
    description: "Adds a new task to the todo list",
    schema: z.object({
      title: z.string(),
    }),
    handler: async ({ title }, ctx) => {
      // ctx.memory is automatically typed as TodoMemory!
      const newTask = {
        id: crypto.randomUUID(),
        title,
        done: false,
      };

      ctx.memory.tasks.push(newTask);

      return {
        success: true,
        taskId: newTask.id,
        message: `Added "${title}" to the list`,
      };
    },
  }),

  action({
    name: "complete-task",
    description: "Marks a task as completed",
    schema: z.object({
      taskId: z.string(),
    }),
    handler: async ({ taskId }, ctx) => {
      const task = ctx.memory.tasks.find((t) => t.id === taskId);
      if (!task) {
        return { success: false, message: "Task not found" };
      }

      task.done = true;

      return {
        success: true,
        message: `Completed "${task.title}"`,
      };
    },
  }),
]);
```

Now these actions only appear when the todo context is active!

## Context Lifecycle

Contexts have hooks for different stages:

```typescript title="context-lifecycle.ts"
const advancedContext = context({
  type: "advanced",
  schema: z.object({ sessionId: z.string() }),

  // Called when context instance is first created
  create: (state, agent) => {
    agent.logger.info(`Creating new session: ${state.key}`);
    return {
      startTime: Date.now(),
      interactions: 0,
    };
  },

  // Called before each LLM interaction
  onStep: async (ctx, agent) => {
    ctx.memory.interactions++;
  },

  // Called when a conversation/run completes
  onRun: async (ctx, agent) => {
    const duration = Date.now() - ctx.memory.startTime;
    agent.logger.info(`Session ${ctx.key} lasted ${duration}ms`);
  },

  // Called if there's an error
  onError: async (error, ctx, agent) => {
    agent.logger.error(`Error in session ${ctx.key}:`, error);
  },
});
```

## Best Practices

### 1. Design Clear Boundaries

```typescript title="good-context-design.ts"
// ✅ Good - clear, specific purpose
const userProfileContext = context({
  type: "user-profile",
  schema: z.object({ userId: z.string() }),
  // Manages user preferences, settings, history
});

const orderContext = context({
  type: "order",
  schema: z.object({ orderId: z.string() }),
  // Manages specific order state, items, shipping
});

// ❌ Bad - too broad, unclear purpose
const stuffContext = context({
  type: "stuff",
  schema: z.object({ id: z.string() }),
  // What does this manage? Everything? Nothing clear.
});
```

### 2. Keep Memory Structures Simple

```typescript title="good-memory-structure.ts"
// ✅ Good - clear, simple structure
interface ChatMemory {
  messages: Array<{
    sender: "user" | "agent";
    content: string;
    timestamp: number;
  }>;
  userPreferences: {
    language?: string;
    timezone?: string;
  };
}

// ❌ Bad - overly complex, nested
interface OverComplexMemory {
  data: {
    nested: {
      deeply: {
        structured: {
          confusing: {
            memory: any;
          };
        };
      };
    };
  };
}
```

### 3. Write Helpful Render Functions

```typescript title="good-render-function.ts"
// ✅ Good - concise, relevant information
render: (state) => `
  Shopping Cart: ${state.args.cartId}
  Items: ${state.memory.items.length}
  Total: $${state.memory.total.toFixed(2)}
  
  Recent items:
  ${state.memory.items
    .slice(-3)
    .map((item) => `- ${item.name} ($${item.price})`)
    .join("\n")}
`;

// ❌ Bad - too much information, overwhelming
render: (state) => JSON.stringify(state.memory, null, 2); // Dumps everything!
```

### 4. Use Descriptive Schema

```typescript title="good-schema.ts"
// ✅ Good - clear descriptions
schema: z.object({
  userId: z.string().uuid().describe("Unique identifier for the user"),
  sessionType: z
    .enum(["support", "sales", "general"])
    .describe("Type of support session"),
});

// ❌ Bad - no descriptions, unclear
schema: z.object({
  id: z.string(),
  type: z.string(),
});
```

## Key Takeaways

* **Contexts separate state** - Each conversation/session/game gets its own
  memory
* **Instance-based** - Same context type, different instances for different
  users/sessions
* **Memory persists** - State is saved between conversations automatically
* **LLM sees context** - Render function shows current state to the AI
* **Context-specific actions** - Attach actions that only work in certain
  contexts
* **Clear boundaries** - Design contexts around specific tasks or domains

Contexts are what make your agent stateful and able to maintain separate
conversations and tasks without mixing things up. They're the foundation for
building agents that can remember and manage complex, ongoing interactions.


file: ./content/docs/core/concepts/core.mdx
meta: {
  "title": "Introduction",
  "description": "Understand the fundamental building blocks of the Daydreams framework."
}
        
The Daydreams framework is designed around a set of core concepts that work
together to enable autonomous agent behavior. Understanding these concepts is
key to effectively building and customizing agents.

## Getting Started

If you're new to agent frameworks, start here:

1. **[Building Blocks](/docs/core/concepts/building-blocks)** - Learn the four
   main components (inputs, outputs, actions, contexts) with simple examples
2. **[Agent Lifecycle](/docs/core/concepts/agent-lifecycle)** - Understand how
   agents process information in a continuous loop

Once you understand the basics, dive deeper into each component:

## Core Architecture

A Daydreams agent consists of several key components:

### Contexts

Contexts are the foundation of a Daydreams agent. Similar to React components,
contexts manage state and rendering for your agent. Each context:

* Has a defined schema for initialization
* Maintains its own memory state
* Provides a rendering function that formats its state for the LLM

```ts title="context.ts"
const myContext = context({
  // Unique identifier for this context type
  type: "my-context",

  // Schema defining the arguments needed to initialize this context
  schema: z.object({
    id: z.string(),
  }),

  // Function to generate a unique key for this context instance
  key({ id }) {
    return id;
  },

  // Initialize the context's memory state
  create(state) {
    return {
      items: [],
      currentItem: null,
    };
  },

  // Format the context for the LLM
  render({ memory }) {
    return `
      Current Items: ${memory.items.join(", ")}
      Active Item: ${memory.currentItem || "None"}
    `;
  },
});
```

### Actions

Actions are functions that your agent can call to interact with its environment
or modify its state. They're similar to event handlers in React:

```ts title="action.ts"
action({
  name: "addItem",
  description: "Add a new item to the list",
  schema: z.object({
    item: z.string().describe("The item to add"),
  }),
  handler(call, ctx, agent) {
    // Access the context memory
    const contextMemory = ctx.agentMemory;

    // Update the state
    contextMemory.items.push(call.data.item);

    // Return a response
    return {
      message: `Added ${call.data.item} to the list`,
      items: contextMemory.items,
    };
  },
});
```

### Extensions

Extensions are pre-packaged bundles of inputs, outputs, and actions that add
specific capabilities to your agent. For example, the `cli` extension adds
terminal input/output capabilities.

## The React-like Mental Model

If you're familiar with React, you can think of Daydreams in similar terms:

* **Contexts** are like React components, managing state and rendering
* **Actions** are like event handlers, responding to inputs and updating state
* **Extensions** are like pre-built component libraries
* The agent itself is like a React application, orchestrating everything

This mental model makes it easy to reason about how your agent works and how to
structure complex behaviors.

***

## Detailed Component Documentation

This section provides a detailed explanation of each fundamental component:

* **[Building Blocks](/docs/core/concepts/building-blocks):** Simple
  introduction to the four main components with examples
* **[Agent Lifecycle](/docs/core/concepts/agent-lifecycle):** How an agent
  processes information, makes decisions, and executes tasks in a continuous
  loop.
* **[Contexts](/docs/core/concepts/contexts):** The mechanism for managing
  state, memory, and behavior for specific tasks or interactions.
* **[Actions](/docs/core/concepts/actions):** Definable tasks or capabilities
  that an agent can perform.
* **[Inputs](/docs/core/concepts/inputs):** How agents receive data and trigger
  processing cycles.
* **[Outputs](/docs/core/concepts/outputs):** How agents communicate results or
  send information to external systems.
* **[Memory](/docs/core/concepts/memory):** The different ways agents store,
  retrieve, and utilize information (Working, Episodic, Vector).
* **[Prompting](/docs/core/concepts/prompting):** How instructions and context
  are formatted for the LLM to guide its reasoning.
* **[Tasks](/docs/core/concepts/tasks):** The system for managing asynchronous
  operations and background tasks.
* **[Services & Extensions](/docs/core/advanced):** How to integrate external
  services and extend the framework's capabilities.

For beginners, start with [Building Blocks](/docs/core/concepts/building-blocks)
to understand the mental model, then explore these detailed pages as needed.


file: ./content/docs/core/concepts/inputs.mdx
meta: {
  "title": "Inputs",
  "description": "How Daydreams agents receive information and trigger processing."
}
        
## What is an Input?

An input is how your agent **listens** to the outside world. If outputs are how
your agent "speaks", inputs are how your agent "hears" things happening.

## Real Examples

Here are inputs that make agents responsive:

### Discord Messages

```typescript title="discord-input.ts"
// Agent listens for Discord messages
const discordMessage = input({
  type: "discord:message",
  schema: z.object({
    content: z.string(),
    userId: z.string(),
    channelId: z.string(),
  }),
  subscribe: (send, agent) => {
    discord.on("messageCreate", (message) => {
      send(
        chatContext,
        { channelId: message.channel.id },
        {
          content: message.content,
          userId: message.author.id,
          channelId: message.channel.id,
        }
      );
    });

    return () => discord.removeAllListeners("messageCreate");
  },
});
```

### CLI Commands

```typescript title="cli-input.ts"
// Agent listens for terminal input
const cliInput = input({
  type: "cli:input",
  schema: z.string(),
  subscribe: (send, agent) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.on("line", (input) => {
      send(cliContext, { sessionId: "cli" }, input);
    });

    return () => readline.close();
  },
});
```

### API Webhooks

```typescript title="webhook-input.ts"
// Agent listens for API webhooks
const webhookInput = input({
  type: "api:webhook",
  schema: z.object({
    event: z.string(),
    data: z.any(),
  }),
  subscribe: (send, agent) => {
    const server = express();

    server.post("/webhook", (req, res) => {
      send(
        webhookContext,
        { eventId: req.body.id },
        {
          event: req.body.event,
          data: req.body.data,
        }
      );
      res.status(200).send("OK");
    });

    const serverInstance = server.listen(3000);
    return () => serverInstance.close();
  },
});
```

## The Problem: Agents Need to Know When Things Happen

Without inputs, your agent can't react to anything:

```text title="deaf-agent.txt"
User sends Discord message: "Hey agent, what's the weather?"
Agent: *doesn't hear anything*
Agent: *sits idle, does nothing*
User: "Hello??"
Agent: *still nothing*
// ❌ Agent can't hear Discord messages
// ❌ No way to trigger the agent
// ❌ Completely unresponsive
```

## The Solution: Inputs Enable Listening

With inputs, your agent can hear and respond:

```text title="listening-agent.txt"
User sends Discord message: "Hey agent, what's the weather?"
Discord Input: *detects new message*
Agent: *wakes up and processes the message*
Agent: *calls weather API*
Agent: *responds via Discord output*
Discord: "It's 72°F and sunny in San Francisco!"
// ✅ Agent hears the message
// ✅ Automatically triggered to respond
// ✅ Completes the conversation
```

## How Inputs Work in Your Agent

### 1. You Define What the Agent Listens For

```typescript title="define-inputs.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  inputs: [
    discordMessage, // Agent listens to Discord
    cliInput, // Agent listens to terminal
    webhookInput, // Agent listens to webhooks
  ],
});
```

### 2. Inputs Watch for Events

When you start your agent, inputs begin listening:

```typescript title="listening-pattern.ts"
// Discord input starts watching for messages
discord.on("messageCreate", (message) => {
  // When message arrives, input sends it to agent
  send(chatContext, { channelId: message.channel.id }, messageData);
});

// CLI input starts watching for terminal input
readline.on("line", (input) => {
  // When user types, input sends it to agent
  send(cliContext, { sessionId: "cli" }, input);
});
```

### 3. Inputs Trigger the Agent

When an input detects something, it "sends" the data to your agent:

```text title="input-flow.txt"
1. Discord message arrives: "What's the weather?"
2. Discord input detects it
3. Input calls: send(chatContext, {channelId: "123"}, {content: "What's the weather?"})
4. Agent wakes up and starts thinking
5. Agent sees the message and decides what to do
6. Agent calls weather action and responds
```

## Creating Your First Input

Here's a simple input that listens for file changes:

```typescript title="file-watcher-input.ts"
import { input } from "@daydreamsai/core";
import { z } from "zod";
import fs from "fs";

export const fileWatcher = input({
  // Type the agent uses to identify this input
  type: "file:watcher",

  // Schema defines what data the input provides
  schema: z.object({
    filename: z.string(),
    content: z.string(),
    event: z.enum(["created", "modified", "deleted"]),
  }),

  // Subscribe function starts listening
  subscribe: (send, agent) => {
    const watchDir = "./watched-files";

    // Watch for file changes
    const watcher = fs.watch(watchDir, (eventType, filename) => {
      if (filename) {
        const filepath = `${watchDir}/${filename}`;

        try {
          const content = fs.readFileSync(filepath, "utf8");

          // Send the file change to the agent
          send(
            fileContext,
            { filename },
            {
              filename,
              content,
              event: eventType === "rename" ? "created" : "modified",
            }
          );
        } catch (error) {
          // File might be deleted
          send(
            fileContext,
            { filename },
            {
              filename,
              content: "",
              event: "deleted",
            }
          );
        }
      }
    });

    // Return cleanup function
    return () => {
      watcher.close();
    };
  },
});
```

Use it in your agent:

```typescript title="agent-with-file-watcher.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  inputs: [fileWatcher],
});

// Now when files change in ./watched-files/:
// 1. File watcher detects the change
// 2. Input sends file data to agent
// 3. Agent can process and respond to file changes
```

## Working with Context Targeting

Inputs need to know which context should handle the incoming data:

```typescript title="context-targeting.ts"
const chatInput = input({
  type: "chat:message",
  schema: z.object({
    message: z.string(),
    userId: z.string(),
  }),
  subscribe: (send, agent) => {
    chatService.on("message", (data) => {
      // Target the specific chat context for this user
      send(
        chatContext,
        { userId: data.userId },
        {
          message: data.message,
          userId: data.userId,
        }
      );
    });

    return () => chatService.removeAllListeners("message");
  },
});
```

This creates separate context instances for each user:

* User "alice" gets context instance `chat:alice`
* User "bob" gets context instance `chat:bob`
* Each maintains separate conversation memory

## Real-Time vs Polling Inputs

### Real-Time (Event-Driven)

```typescript title="realtime-input.ts"
// ✅ Good - responds immediately
subscribe: (send, agent) => {
  websocket.on("message", (data) => {
    send(context, args, data);
  });

  return () => websocket.close();
};
```

### Polling (Check Periodically)

```typescript title="polling-input.ts"
// Sometimes necessary for APIs without webhooks
subscribe: (send, agent) => {
  const checkForUpdates = async () => {
    const newData = await api.getUpdates();
    if (newData.length > 0) {
      newData.forEach((item) => {
        send(context, { id: item.id }, item);
      });
    }
  };

  const interval = setInterval(checkForUpdates, 5000); // Every 5 seconds

  return () => clearInterval(interval);
};
```

## Multiple Inputs Working Together

Your agent can listen to multiple sources simultaneously:

```typescript title="multiple-inputs.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  inputs: [
    discordMessage, // Discord messages
    slackMessage, // Slack messages
    emailReceived, // New emails
    webhookReceived, // API webhooks
    fileChanged, // File system changes
    timerTick, // Scheduled events
  ],
});

// Agent now responds to any of these inputs automatically
```

## Error Handling and Validation

Always handle errors gracefully in your inputs:

```typescript title="error-handling-input.ts"
const robustInput = input({
  type: "api:events",
  schema: z.object({
    eventId: z.string(),
    data: z.any(),
  }),
  subscribe: (send, agent) => {
    api.on("event", (rawData) => {
      try {
        // Validate the data first
        const validData = {
          eventId: rawData.id,
          data: rawData.payload,
        };

        // Schema validation happens automatically
        send(eventContext, { eventId: rawData.id }, validData);
      } catch (error) {
        agent.logger.error("api:events", "Invalid event data", {
          rawData,
          error: error.message,
        });
        // Don't crash - just log and continue
      }
    });

    return () => api.removeAllListeners("event");
  },
});
```

## Best Practices

### 1. Use Clear Types and Schemas

```typescript title="good-input-definition.ts"
// ✅ Good - clear purpose and validation
const userMessage = input({
  type: "user:message",
  schema: z.object({
    content: z.string().min(1).max(2000),
    userId: z.string().uuid(),
    timestamp: z.number(),
  }),
  // ...
});

// ❌ Bad - unclear and unvalidated
const dataInput = input({
  type: "data",
  schema: z.any(),
  // ...
});
```

### 2. Always Return Cleanup Functions

```typescript title="cleanup-function.ts"
// ✅ Good - proper cleanup
subscribe: (send, agent) => {
  const listener = (data) => send(context, args, data);

  eventSource.addEventListener("event", listener);

  return () => {
    eventSource.removeEventListener("event", listener);
    eventSource.close();
  };
};

// ❌ Bad - no cleanup (memory leaks!)
subscribe: (send, agent) => {
  eventSource.addEventListener("event", (data) => {
    send(context, args, data);
  });

  return () => {}; // Nothing cleaned up!
};
```

### 3. Handle Connection Failures

```typescript title="reconnection-input.ts"
subscribe: (send, agent) => {
  let reconnectAttempts = 0;
  const maxReconnects = 5;

  const connect = () => {
    try {
      const connection = createConnection();

      connection.on("data", (data) => {
        reconnectAttempts = 0; // Reset on successful data
        send(context, args, data);
      });

      connection.on("error", () => {
        if (reconnectAttempts < maxReconnects) {
          reconnectAttempts++;
          setTimeout(connect, 1000 * reconnectAttempts);
        }
      });

      return connection;
    } catch (error) {
      agent.logger.error("connection failed", error);
    }
  };

  const connection = connect();

  return () => connection?.close();
};
```

### 4. Target the Right Context

```typescript title="context-routing.ts"
subscribe: (send, agent) => {
  service.on("event", (event) => {
    // Route to appropriate context based on event type
    if (event.type === "user_message") {
      send(chatContext, { userId: event.userId }, event.data);
    } else if (event.type === "system_alert") {
      send(alertContext, { alertId: event.id }, event.data);
    } else if (event.type === "game_move") {
      send(gameContext, { gameId: event.gameId }, event.data);
    }
  });

  return () => service.removeAllListeners("event");
};
```

## Key Takeaways

* **Inputs enable responsiveness** - Without them, agents can't hear anything
* **Subscribe pattern** - Watch external sources, call `send()` when data
  arrives
* **Context targeting** - Route inputs to appropriate context instances
* **Always cleanup** - Return functions to disconnect when agent stops
* **Validate data** - Use schemas to ensure incoming data is correct
* **Handle errors gracefully** - Don't let bad input data crash your agent

Inputs are what turn your agent from a one-time script into a responsive,
always-listening assistant that can react to the world in real-time.

file: ./content/docs/core/concepts/memory.mdx
meta: {
  "title": "Memory",
  "description": "How Daydreams agents store, recall, and learn from information."
}
        
## What is Memory?

Memory is how your agent **remembers** things between conversations. Just like
you remember what you talked about yesterday, agents need memory to be helpful
over time.

## Real Examples

Here are different types of memory your agent uses:

### Short-Term Memory (This Conversation)

```typescript title="short-term-memory.ts"
// What happened in the current conversation
const workingMemory = {
  messages: [
    { user: "What's the weather?" },
    { agent: "Let me check..." },
    { action: "getWeather", result: "72°F, sunny" },
    { agent: "It's 72°F and sunny!" },
  ],
  // This gets cleared when conversation ends
};
```

### Long-Term Memory (Persistent Data)

```typescript title="long-term-memory.ts"
// What the agent remembers about you
const contextMemory = {
  userId: "alice",
  preferences: {
    favoriteColor: "blue",
    timezone: "America/New_York",
    wantsDetailedWeather: true,
  },
  chatHistory: [
    "Discussed weather preferences on 2024-01-15",
    "Helped with todo list on 2024-01-16",
  ],
  // This persists forever
};
```

### Experience Memory (Learning from Past)

```typescript title="experience-memory.ts"
// What the agent learned from previous interactions
const episodicMemory = [
  {
    situation: "User asked about weather in winter",
    action: "Provided temperature + suggested warm clothes",
    result: "User was happy and thanked me",
    lesson: "Winter weather queries benefit from clothing suggestions",
  },
  // Agent can recall and apply these lessons to new situations
];
```

## The Problem: Agents Without Memory Are Useless

Without memory, every conversation starts from scratch:

```text title="forgetful-agent.txt"
Day 1:
User: "My name is Alice and I like detailed weather reports"
Agent: "Nice to meet you Alice! I'll remember you like detailed weather."

Day 2:
User: "What's the weather?"
Agent: "Hi! I'm not sure who you are. What kind of weather info do you want?"
// ❌ Forgot everything about Alice
// ❌ Has to ask the same questions again
// ❌ Terrible user experience
```

## The Solution: Memory Makes Agents Smart

With memory, agents get better over time:

```text title="smart-agent.txt"
Day 1:
User: "My name is Alice and I like detailed weather reports"
Agent: "Nice to meet you Alice! I'll remember you like detailed weather."
→ Saves: { user: "Alice", preferences: { detailedWeather: true } }

Day 2:
User: "What's the weather?"
Agent: → Loads: { user: "Alice", preferences: { detailedWeather: true } }
Agent: "Hi Alice! It's 72°F and sunny with 15mph winds from the west,
       humidity at 45%, and clear skies expected all day."
// ✅ Remembered Alice and her preferences
// ✅ Provided detailed weather automatically
// ✅ Great user experience
```

## How Memory Works in Your Agent

### 1. Agent Automatically Saves Important Information

```typescript title="automatic-memory.ts"
// Your agent's context automatically saves important info
const chatContext = context({
  type: "chat",
  schema: z.object({ userId: z.string() }),

  create: () => ({
    preferences: {},
    chatHistory: [],
    firstMet: new Date().toISOString(),
  }),

  // This memory persists between conversations
});

// When user says: "I prefer metric units"
// Agent automatically saves: preferences.units = "metric"
// Next conversation: Agent uses metric units automatically
```

### 2. Different Types of Memory for Different Needs

```typescript title="memory-types.ts"
const agent = createDreams({
  model: openai("gpt-4o"),

  // Configure where memory gets saved
  memory: createMemory(
    // Long-term storage (user preferences, chat history)
    await createMongoMemoryStore({ uri: "mongodb://localhost:27017" }),

    // Experience storage (what worked well in the past)
    createChromaVectorStore("agent-experiences")
  ),

  // Enable automatic learning from conversations
  generateMemories: true,
});
```

### 3. Agent Recalls Relevant Memories

```text title="memory-recall.txt"
New user question: "How do I cook pasta?"

Agent thinks:
1. Check if I know this user (loads context memory)
2. Recall similar past conversations (searches experience memory)
3. Found: "Previous users liked step-by-step cooking instructions"
4. Respond with detailed cooking steps

Result: Agent gives better answer based on past experience!
```

## Setting Up Memory in Your Agent

Here's how to add memory to your agent:

### Basic Memory (In-Memory)

```typescript title="basic-memory.ts"
import {
  createDreams,
  createMemory,
  createMemoryStore,
} from "@daydreamsai/core";

const agent = createDreams({
  model: openai("gpt-4o"),

  // Basic memory - data lost when agent restarts
  memory: createMemory(
    createMemoryStore(), // Stores in RAM
    createVectorStore() // No persistent experience storage
  ),
});
```

### Persistent Memory (Database)

```typescript title="persistent-memory.ts"
import { createMongoMemoryStore } from "@daydreamsai/mongo";
import { createChromaVectorStore } from "@daydreamsai/chroma";

const agent = createDreams({
  model: openai("gpt-4o"),

  // Persistent memory - data survives restarts
  memory: createMemory(
    // Save to MongoDB
    await createMongoMemoryStore({
      uri: "mongodb://localhost:27017",
      dbName: "my-agent-memory",
    }),

    // Save experiences to ChromaDB for learning
    createChromaVectorStore("my-agent-experiences")
  ),

  // Enable automatic learning
  generateMemories: true,
});
```

## Working with Context Memory

Context memory is what your agent remembers about specific conversations:

```typescript title="context-memory-usage.ts"
const userProfileContext = context({
  type: "user-profile",
  schema: z.object({ userId: z.string() }),

  // Define what to remember about each user
  create: () => ({
    name: null,
    preferences: {
      language: "en",
      timezone: null,
      communicationStyle: "friendly",
    },
    chatSummary: [],
    lastSeen: null,
  }),

  // How this memory appears to the LLM
  render: (state) => `
User Profile: ${state.args.userId}
Name: ${state.memory.name || "Unknown"}
Preferences: ${JSON.stringify(state.memory.preferences)}
Last interaction: ${state.memory.lastSeen || "First time"}

Recent chat summary:
${state.memory.chatSummary.slice(-3).join("\n")}
  `,
});
```

### Actions Can Update Memory

```typescript title="memory-updating-action.ts"
const updatePreferenceAction = action({
  name: "update-user-preference",
  description: "Updates a user's preference",
  schema: z.object({
    key: z.string(),
    value: z.string(),
  }),

  handler: async ({ key, value }, ctx) => {
    // Update the user's memory
    ctx.memory.preferences[key] = value;
    ctx.memory.lastSeen = new Date().toISOString();

    // Memory automatically saves after this action
    return {
      success: true,
      message: `Updated ${key} to ${value}`,
    };
  },
});
```

## Experience Memory: Learning from the Past

Your agent can learn from previous conversations:

```typescript title="experience-learning.ts"
// Enable automatic experience generation
const agent = createDreams({
  model: openai("gpt-4o"),
  memory: createMemory(
    await createMongoMemoryStore({ uri: "mongodb://localhost:27017" }),
    createChromaVectorStore("experiences")
  ),

  // Agent automatically creates "episodes" from conversations
  generateMemories: true,

  // Optional: Export training data for fine-tuning
  exportTrainingData: true,
  trainingDataPath: "./agent-training.jsonl",
});

// Now when user asks: "How do I bake a cake?"
// Agent recalls: "I helped someone bake a cake before. They liked step-by-step instructions with temperatures."
// Agent provides: Detailed baking instructions with exact temperatures and times
```

## Memory in Action: Complete Example

Here's how all the memory types work together:

```typescript title="complete-memory-example.ts"
// 1. User starts conversation
User: "Hi, I'm Sarah. I'm learning to cook."

// 2. Agent creates/loads context memory
Context Memory: {
  name: null,  // Will be updated
  interests: [], // Will be updated
  skillLevel: null // Will be updated
}

// 3. Agent processes and updates memory
Action: updateUserProfile({
  name: "Sarah",
  interests: ["cooking"],
  skillLevel: "beginner"
})

// 4. Later conversation
User: "How do I make pasta?"

// 5. Agent loads Sarah's memory
Context Memory: {
  name: "Sarah",
  interests: ["cooking"],
  skillLevel: "beginner"  // Agent knows she's a beginner!
}

// 6. Agent recalls similar past experiences
Experience Memory: "When helping beginners with pasta, detailed steps work best"

// 7. Agent responds appropriately
Agent: "Hi Sarah! Since you're learning to cook, I'll give you detailed step-by-step pasta instructions..."

// ✅ Personalized response based on memory!
```

## Best Practices

### 1. Choose the Right Memory Storage

```typescript title="memory-storage-choice.ts"
// ✅ Good for development - simple setup
memory: createMemory(
  createMemoryStore(), // In-memory, lost on restart
  createVectorStore() // No learning capabilities
);

// ✅ Good for production - data persists
memory: createMemory(
  await createMongoMemoryStore({ uri: process.env.MONGODB_URI }),
  createChromaVectorStore("prod-experiences")
);
```

### 2. Design Clear Memory Structures

```typescript title="clear-memory-structure.ts"
// ✅ Good - clear, organized structure
interface UserMemory {
  profile: {
    name: string;
    email: string;
    joinDate: string;
  };
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
  };
  activityHistory: Array<{
    action: string;
    timestamp: string;
    result: string;
  }>;
}

// ❌ Bad - everything mixed together
interface MessyMemory {
  stuff: any;
  data: any;
  things: any;
}
```

### 3. Don't Store Too Much

```typescript title="memory-size-management.ts"
// ✅ Good - keep recent, relevant data
render: (state) => {
  const recentChats = state.memory.chatHistory.slice(-5); // Last 5 only
  const importantPrefs = {
    language: state.memory.preferences.language,
    timezone: state.memory.preferences.timezone,
  };

  return `Recent activity: ${recentChats.join("\n")}`;
};

// ❌ Bad - dump everything
render: (state) => JSON.stringify(state.memory); // Overwhelming!
```

### 4. Handle Memory Gracefully

```typescript title="graceful-memory-handling.ts"
handler: async ({ userId }, ctx) => {
  try {
    // Try to load user memory
    const userPrefs = ctx.memory.preferences || {};

    // Provide defaults if memory is empty
    const language = userPrefs.language || "en";
    const timezone = userPrefs.timezone || "UTC";

    return { language, timezone };
  } catch (error) {
    // Handle memory errors gracefully
    console.error("Memory error:", error);
    return { language: "en", timezone: "UTC" }; // Safe defaults
  }
};
```

## Memory Types Summary

| Memory Type           | Purpose               | Lifetime            | Example                                |
| --------------------- | --------------------- | ------------------- | -------------------------------------- |
| **Working Memory**    | Current conversation  | Single conversation | "User just asked about weather"        |
| **Context Memory**    | User/session data     | Persists forever    | "Alice prefers detailed weather"       |
| **Action Memory**     | Action-specific state | Persists forever    | "Weather API called 47 times today"    |
| **Experience Memory** | Learning from past    | Persists forever    | "Users like step-by-step cooking help" |

## Key Takeaways

* **Memory makes agents smart** - Without it, every conversation starts from
  scratch
* **Multiple memory types** - Short-term (conversation), long-term (user data),
  experience (learning)
* **Automatic persistence** - Agent saves important information without extra
  code
* **Experience learning** - Agent gets better over time by remembering what
  works
* **Choose storage wisely** - In-memory for development, database for production
* **Keep it organized** - Clear memory structures make agents more reliable

Memory transforms your agent from a stateless chatbot into an intelligent
assistant that learns, remembers, and gets better with every interaction.


file: ./content/docs/core/concepts/outputs.mdx
meta: {
  "title": "Outputs",
  "description": "How Daydreams agents send information and responses."
}
        
## What is an Output?

An output is how your agent **sends** information to the outside world. If
actions are what your agent can "do", outputs are how your agent "speaks" or
"responds".

## Real Examples

Here are outputs that make agents useful:

### Discord Message

```typescript title="discord-output.ts"
// Agent can send Discord messages
const discordMessage = output({
  type: "discord:message",
  description: "Sends a message to Discord",
  schema: z.string(),
  attributes: z.object({
    channelId: z.string(),
  }),
  handler: async (message, ctx) => {
    await discord.send(ctx.outputRef.params.channelId, message);
    return { sent: true };
  },
});
```

### Console Print

```typescript title="console-output.ts"
// Agent can print to console
const consolePrint = output({
  type: "console:print",
  description: "Prints a message to the console",
  schema: z.string(),
  handler: async (message) => {
    console.log(`Agent: ${message}`);
    return { printed: true };
  },
});
```

### Email Notification

```typescript title="email-output.ts"
// Agent can send emails
const emailOutput = output({
  type: "email:send",
  description: "Sends an email notification",
  schema: z.string(),
  attributes: z.object({
    to: z.string(),
    subject: z.string(),
  }),
  handler: async (body, ctx) => {
    const { to, subject } = ctx.outputRef.params;
    await emailService.send({ to, subject, body });
    return { emailSent: true };
  },
});
```

## The Problem: Agents Need to Communicate

Without outputs, your agent can think but can't communicate:

```text title="silent-agent.txt"
User: "Send me the weather report"
Agent: *calls weather API internally*
Agent: *knows it's 72°F and sunny*
Agent: *...but can't tell you!*
// ❌ Agent gets the data but you never see it
// ❌ No way to respond or communicate
// ❌ Useless to humans
```

## The Solution: Outputs Enable Communication

With outputs, your agent can respond properly:

```text title="communicating-agent.txt"
User: "Send me the weather report"
Agent: *calls weather API*
Agent: *gets weather data*
Agent: *uses discord:message output*
Discord: "It's 72°F and sunny in San Francisco!"
// ✅ Agent gets data AND tells you about it
// ✅ Complete conversation loop
// ✅ Actually useful
```

## How Outputs Work in Your Agent

### 1. You Define How the Agent Can Respond

```typescript title="define-outputs.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  outputs: [
    discordMessage, // Agent can send Discord messages
    consolePrint, // Agent can print to console
    emailOutput, // Agent can send emails
  ],
});
```

### 2. The LLM Decides When to Respond

When the agent thinks, it sees:

```text title="llm-sees-outputs.txt"
Available outputs:
- discord:message: Sends a message to Discord
- console:print: Prints a message to the console
- email:send: Sends an email notification

User asked: "Check weather and let me know via Discord"
```

### 3. The LLM Uses Outputs to Respond

The LLM responds with structured output calls:

```xml title="llm-uses-outputs.xml"
<response>
  <reasoning>User wants weather info via Discord. I'll get weather then send message.</reasoning>

  <action_call name="get-weather">{"city": "San Francisco"}</action_call>

  <output type="discord:message" channelId="123456789">
    Weather in San Francisco: {{calls[0].temperature}}, {{calls[0].condition}}
  </output>
</response>
```

### 4. Daydreams Sends the Output

Daydreams automatically:

* Validates the output format
* Runs your handler function
* Actually sends the Discord message
* Logs the result

## Creating Your First Output

Here's a simple output that saves messages to a file:

```typescript title="file-output.ts"
import { output } from "@daydreamsai/core";
import { z } from "zod";
import fs from "fs/promises";

export const saveToFile = output({
  // Type the LLM uses to call this output
  type: "file:save",

  // Description helps LLM know when to use it
  description: "Saves a message to a text file",

  // Schema defines what content is expected
  schema: z.string().describe("The message to save"),

  // Attributes define extra parameters on the output tag
  attributes: z.object({
    filename: z.string().describe("Name of the file to save to"),
  }),

  // Handler is your actual code that runs
  handler: async (message, ctx) => {
    const { filename } = ctx.outputRef.params;

    await fs.writeFile(filename, message + "\n", { flag: "a" });

    return {
      saved: true,
      filename,
      message: `Saved message to ${filename}`,
    };
  },
});
```

Use it in your agent:

```typescript title="agent-with-file-output.ts"
const agent = createDreams({
  model: openai("gpt-4o"),
  outputs: [saveToFile],
});

// Now when the LLM wants to save something:
// <output type="file:save" filename="log.txt">This is my message</output>
// The message gets saved to log.txt
```

## Working with Context Memory

Outputs can read and update your agent's memory:

```typescript title="notification-output.ts"
// Define what your context remembers
interface ChatMemory {
  messagesSent: number;
  lastNotification?: string;
}

const notificationOutput = output({
  type: "notification:send",
  description: "Sends a notification to the user",
  schema: z.string(),
  attributes: z.object({
    priority: z.enum(["low", "medium", "high"]),
  }),
  handler: async (message, ctx) => {
    // Access context memory (automatically typed!)
    const memory = ctx.memory as ChatMemory;

    // Update statistics
    if (!memory.messagesSent) {
      memory.messagesSent = 0;
    }
    memory.messagesSent++;
    memory.lastNotification = message;

    // Send the actual notification
    const { priority } = ctx.outputRef.params;
    await notificationService.send({
      message,
      priority,
      userId: ctx.args.userId,
    });

    // Changes to memory are automatically saved
    return {
      sent: true,
      totalSent: memory.messagesSent,
      message: `Notification sent (total: ${memory.messagesSent})`,
    };
  },
});
```

## Outputs vs Actions: When to Use Which?

Understanding the difference is crucial:

### Use **Outputs** When:

* **Communicating results** to users or external systems
* **You don't need a response** back for the LLM to continue
* **Final step** in a conversation or workflow

```typescript title="output-example.ts"
// ✅ Good use of output - telling user the result
<output type="discord:message" channelId="123">
  Weather: 72°F, sunny. Have a great day!
</output>
```

### Use **Actions** When:

* **Getting data** the LLM needs for next steps
* **You need the result** for further reasoning
* **Middle step** in a complex workflow

```typescript title="action-example.ts"
// ✅ Good use of action - getting data for next step
<action_call name="get-weather">{"city": "San Francisco"}</action_call>
// LLM will use this result to decide what to tell the user
```

### Common Pattern: Actions → Outputs

```xml title="action-then-output.xml"
<response>
  <reasoning>I'll get weather data, then tell the user about it</reasoning>

  <!-- Action: Get data -->
  <action_call name="get-weather">{"city": "Boston"}</action_call>

  <!-- Output: Communicate result -->
  <output type="discord:message" channelId="123">
    Boston weather: {{calls[0].temperature}}, {{calls[0].condition}}
  </output>
</response>
```

## Advanced: Multiple Outputs

Your agent can send multiple outputs in one response:

```xml title="multiple-outputs.xml"
<response>
  <reasoning>I'll notify both Discord and email about this important update</reasoning>

  <output type="discord:message" channelId="123">
    🚨 Server maintenance starting in 10 minutes!
  </output>

  <output type="email:send" to="admin@company.com" subject="Maintenance Alert">
    Server maintenance is beginning in 10 minutes. All users have been notified via Discord.
  </output>
</response>
```

## External Service Integration

Outputs are perfect for integrating with external services:

```typescript title="slack-output.ts"
const slackMessage = output({
  type: "slack:message",
  description: "Sends a message to Slack",
  schema: z.string(),
  attributes: z.object({
    channel: z.string().describe("Slack channel name"),
    threadId: z.string().optional().describe("Thread ID for replies"),
  }),
  handler: async (message, ctx) => {
    try {
      const { channel, threadId } = ctx.outputRef.params;

      const result = await slackClient.chat.postMessage({
        channel,
        text: message,
        thread_ts: threadId,
      });

      return {
        success: true,
        messageId: result.ts,
        channel: result.channel,
        message: `Message sent to #${channel}`,
      };
    } catch (error) {
      console.error("Failed to send Slack message:", error);

      return {
        success: false,
        error: error.message,
        message: "Failed to send Slack message",
      };
    }
  },
});
```

## Best Practices

### 1. Use Clear Types and Descriptions

```typescript title="good-naming.ts"
// ✅ Good - clear what it does
const userNotification = output({
  type: "user:notification",
  description:
    "Sends a notification directly to the user via their preferred channel",
  // ...
});

// ❌ Bad - unclear purpose
const sendStuff = output({
  type: "send",
  description: "Sends something",
  // ...
});
```

### 2. Validate Input with Schemas

```typescript title="good-schemas.ts"
// ✅ Good - specific validation
schema: z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(2000),
  urgency: z.enum(["low", "medium", "high"]),
});

// ❌ Bad - too loose
schema: z.any();
```

### 3. Handle Errors Gracefully

```typescript title="error-handling.ts"
handler: async (message, ctx) => {
  try {
    await sendMessage(message);
    return { sent: true };
  } catch (error) {
    // Log for debugging
    console.error("Failed to send message:", error);

    // Return structured error info
    return {
      sent: false,
      error: error.message,
      message: "Failed to send message - will retry later",
    };
  }
};
```

### 4. Use Async/Await for External Services

```typescript title="async-best-practice.ts"
// ✅ Good - properly handles async
handler: async (message, ctx) => {
  const result = await emailService.send(message);
  return { emailId: result.id };
};

// ❌ Bad - doesn't wait for async operations
handler: (message, ctx) => {
  emailService.send(message); // This returns a Promise that's ignored!
  return { status: "sent" }; // Completes before email actually sends
};
```

### 5. Provide Good Examples

```typescript title="good-examples.ts"
examples: [
  '<output type="discord:message" channelId="123456789">Hello everyone!</output>',
  '<output type="discord:message" channelId="987654321" replyToUserId="user123">Thanks for the question!</output>',
];
```

## Key Takeaways

* **Outputs enable communication** - Without them, agents can think but not
  respond
* **LLM chooses when to use them** - Based on types and descriptions you provide
* **Different from actions** - Outputs communicate results, actions get data
* **Content and attributes validated** - Zod schemas ensure correct format
* **Memory can be updated** - Track what was sent for future reference
* **Error handling is crucial** - External services can fail, handle gracefully

Outputs complete the conversation loop - they're how your intelligent agent
becomes a helpful communicator that users can actually interact with.


file: ./content/docs/core/concepts/prompting.mdx
meta: {
  "title": "Prompting",
  "description": "How Daydreams structures prompts to guide LLM reasoning and actions."
}
        
## What is a Prompt?

A prompt is the text you send to an AI model to tell it what to do. Think of it
like giving instructions to a smart assistant.

## Simple Prompts vs Agent Prompts

### Simple Prompt (ChatGPT style)

```text title="simple-prompt.txt"
User: What's the weather in New York?
Assistant: I don't have access to real-time weather data...
```

### Agent Prompt (what Daydreams creates)

```text title="agent-prompt.txt"
You are an AI agent that can:
- Call weather APIs
- Send Discord messages
- Remember conversation history

Current situation:
- User asked: "What's the weather in New York?"
- Available actions: getWeather, sendMessage
- Chat context: user123 in #general channel

Please respond with:
<action_call name="getWeather">{"city": "New York"}</action_call>
<output type="discord:message">It's 72°F and sunny in New York!</output>
```

## The Problem: LLMs Need Structure

Without structure, LLMs can't:

* Know what tools they have available
* Remember previous conversations
* Follow consistent output formats
* Handle complex multi-step tasks

**Example of what goes wrong:**

```text title="unstructured-problem.txt"
User: "Check weather and send to Discord"
LLM: "I'll check the weather for you!"
// ❌ Doesn't actually call any APIs
// ❌ Doesn't know how to send to Discord
// ❌ Just generates text
```

## The Solution: Structured Prompts

Daydreams automatically creates structured prompts that include:

1. **Available Tools** - What the agent can do
2. **Current State** - What's happening right now
3. **Response Format** - How to respond properly
4. **Context Memory** - What happened before

```text title="structured-solution.txt"
Available Actions:
- getWeather(city: string) - Gets current weather
- sendDiscord(message: string) - Sends Discord message

Current Context:
- User: user123
- Channel: #general
- Previous messages: [...]

New Input:
- "Check weather in Boston and send to Discord"

Respond with XML:
<action_call name="getWeather">{"city": "Boston"}</action_call>
<output type="discord:message">Weather in Boston: 65°F, cloudy</output>
```

## How Daydreams Builds Prompts

Every time your agent thinks, Daydreams automatically builds a prompt like this:

### 1. Instructions

```text title="instructions-section.txt"
You are an AI agent. Your job is to:
- Analyze new information
- Decide what actions to take
- Respond appropriately
```

### 2. Available Tools

```xml title="tools-section.xml"
<available-actions>
  <action name="getWeather">
    <description>Gets current weather for a city</description>
    <schema>{"type": "object", "properties": {"city": {"type": "string"}}}</schema>
  </action>
</available-actions>

<available-outputs>
  <output type="discord:message">
    <description>Sends a message to Discord</description>
    <schema>{"type": "string"}</schema>
  </output>
</available-outputs>
```

### 3. Current Context State

```xml title="context-section.xml"
<contexts>
  <context type="chat" key="user123">
    Previous messages:
    user123: Hi there!
    agent: Hello! How can I help?
    user123: What's the weather like?
  </context>
</contexts>
```

### 4. What Just Happened

```xml title="updates-section.xml"
<updates>
  <input type="discord:message" timestamp="2024-01-15T10:30:00Z">
    What's the weather in Boston?
  </input>
</updates>
```

### 5. Expected Response Format

```xml title="response-format.xml"
Respond with:
<response>
  <reasoning>Your thought process here</reasoning>
  <action_call name="actionName">{"argument": "value"}</action_call>
  <output type="outputType">Your response here</output>
</response>
```

## What the LLM Sees (Complete Example)

Here's what a complete prompt looks like:

```text title="complete-prompt.txt"
You are an AI agent. Analyze the updates and decide what to do.

<available-actions>
  <action name="getWeather">
    <description>Gets current weather for a city</description>
    <schema>{"type": "object", "properties": {"city": {"type": "string"}}}</schema>
  </action>
</available-actions>

<available-outputs>
  <output type="discord:message">
    <description>Sends a message to Discord</description>
    <schema>{"type": "string"}</schema>
  </output>
</available-outputs>

<contexts>
  <context type="chat" key="user123">
    user123: Hi there!
    agent: Hello! How can I help?
  </context>
</contexts>

<working-memory>
  <!-- Previous actions from this conversation -->
</working-memory>

<updates>
  <input type="discord:message" timestamp="2024-01-15T10:30:00Z">
    What's the weather in Boston?
  </input>
</updates>

Respond with:
<response>
  <reasoning>Your thought process</reasoning>
  <action_call name="actionName">{"arg": "value"}</action_call>
  <output type="outputType">Your message</output>
</response>
```

## LLM Response Example

The LLM responds with structured XML:

```xml title="llm-response.xml"
<response>
  <reasoning>
    The user is asking about weather in Boston. I should:
    1. Call the getWeather action to get current conditions
    2. Send the result to Discord
  </reasoning>

  <action_call name="getWeather">{"city": "Boston"}</action_call>
  <output type="discord:message">Checking the weather in Boston for you!</output>
</response>
```

Daydreams automatically:

* Parses the `<action_call>` and runs the weather API
* Parses the `<output>` and sends the Discord message
* Saves the `<reasoning>` for debugging

## Advanced Features

### Template References

LLMs can reference previous action results within the same response:

```xml title="template-example.xml"
<response>
  <reasoning>I'll get weather, then send a detailed message</reasoning>

  <action_call name="getWeather">{"city": "Boston"}</action_call>

  <output type="discord:message">
    Weather in Boston: {{calls[0].temperature}}°F, {{calls[0].condition}}
  </output>
</response>
```

The `{{calls[0].temperature}}` gets replaced with the actual weather data.

### Multi-Context Prompts

When multiple contexts are active:

```xml title="multi-context.xml"
<contexts>
  <context type="chat" key="user123">
    Chat history with user123...
  </context>

  <context type="game" key="session456">
    Current game state: level 5, health 80...
  </context>
</contexts>
```

## Key Benefits

* **Consistency** - All agents use the same reliable prompt structure
* **Clarity** - LLMs always know what tools they have and how to use them
* **Memory** - Context and conversation history included automatically
* **Debugging** - You can see exactly what the LLM was told
* **Extensibility** - Easy to add new actions and outputs

## Customizing Prompts

You can customize prompts in your contexts:

```typescript title="custom-instructions.ts"
const chatContext = context({
  type: "chat",
  schema: z.object({ userId: z.string() }),

  // Custom instructions for this context
  instructions: (state) =>
    `You are helping user ${state.args.userId}. Be friendly and helpful.`,

  // Custom context rendering
  render: (state) => `
    Chat with ${state.args.userId}
    Recent messages: ${state.memory.messages.slice(-3).join("\n")}
    User mood: ${state.memory.userMood || "neutral"}
  `,
});
```

## Key Takeaways

* **Prompts are automatically generated** - You don't write them manually
* **Structure enables capabilities** - Tools, memory, and context included
  automatically
* **LLMs respond with XML** - Parsed automatically into actions and outputs
* **Templates enable complex flows** - Reference previous results within
  responses
* **Customizable per context** - Add specific instructions and state rendering

The prompting system is what makes your agent intelligent - it provides the LLM
with everything needed to understand the situation and respond appropriately.


file: ./content/docs/core/concepts/tasks.mdx
meta: {
  "title": "Tasks",
  "description": "Managing asynchronous operations and concurrency."
}
        
## What is a Task?

A task is any operation that takes time to complete, like:

* Calling a weather API (might take 500ms)
* Saving data to a database (might take 200ms)
* Processing an image (might take 2 seconds)
* Sending an email (might take 1 second)

## The Problem

Imagine your agent needs to do 10 things at once:

```typescript title="problem-example.ts"
// User asks: "What's the weather in 5 cities?"
// Agent needs to call weather API 5 times
// Without task management:
await getWeather("New York"); // 500ms
await getWeather("London"); // 500ms
await getWeather("Tokyo"); // 500ms
await getWeather("Paris"); // 500ms
await getWeather("Sydney"); // 500ms
// Total: 2.5 seconds (slow!)
```

Even worse - what if your agent tries to make 100 API calls at once? The
external service might block you or your server might crash.

## The Solution: Task Management

Daydreams automatically manages these operations for you:

```typescript title="solution-example.ts"
// With task management:
// Runs 3 operations at the same time (concurrent)
// Queues the rest until the first ones finish
// Total: ~1 second (much faster!)

const results = await Promise.all([
  getWeather("New York"), // Starts immediately
  getWeather("London"), // Starts immediately
  getWeather("Tokyo"), // Starts immediately
  getWeather("Paris"), // Waits in queue
  getWeather("Sydney"), // Waits in queue
]);
```

## How It Works in Your Agent

When you write action handlers, this happens automatically:

```typescript title="weather-action.ts"
const weatherAction = action({
  name: "get-weather",
  description: "Get weather for a city",
  schema: z.object({
    city: z.string(),
  }),
  handler: async ({ city }) => {
    // This handler runs as a "task"
    // Daydreams automatically:
    // 1. Limits how many run at once (default: 3)
    // 2. Queues extras until slots open up
    // 3. Handles errors and retries

    const response = await fetch(`https://api.weather.com/${city}`);
    return await response.json();
  },
});
```

When your LLM calls this action multiple times:

```xml
<action_call name="get-weather">{"city": "New York"}</action_call>
<action_call name="get-weather">{"city": "London"}</action_call>
<action_call name="get-weather">{"city": "Tokyo"}</action_call>
<action_call name="get-weather">{"city": "Paris"}</action_call>
```

Daydreams automatically:

* Runs the first 3 immediately
* Queues "Paris" until one finishes
* Prevents your agent from overwhelming the weather API

## Configuring Task Limits

You can control how many tasks run simultaneously:

```typescript title="agent-config.ts"
import { createDreams, TaskRunner } from "@daydreamsai/core";

// Default: 3 tasks at once
const agent = createDreams({
  model: openai("gpt-4o"),
  extensions: [weatherExtension],
});

// Custom: 5 tasks at once (for faster APIs)
const fasterAgent = createDreams({
  model: openai("gpt-4o"),
  extensions: [weatherExtension],
  taskRunner: new TaskRunner(5),
});

// Custom: 1 task at once (for rate-limited APIs)
const slowAgent = createDreams({
  model: openai("gpt-4o"),
  extensions: [weatherExtension],
  taskRunner: new TaskRunner(1),
});
```

## Best Practices for Action Handlers

### 1. Use async/await Properly

```typescript title="good-handler.ts"
// ✅ Good - properly handles async operations
handler: async ({ userId }) => {
  const user = await database.getUser(userId);
  const preferences = await database.getPreferences(userId);
  return { user, preferences };
};

// ❌ Bad - doesn't wait for async operations
handler: ({ userId }) => {
  database.getUser(userId); // This returns a Promise!
  return { status: "done" }; // Completes before database call finishes
};
```

### 2. Handle Cancellation for Long Operations

```typescript title="cancellation-example.ts"
handler: async ({ largeDataset }, ctx) => {
  for (let i = 0; i < largeDataset.length; i++) {
    // Check if the agent wants to cancel this task
    if (ctx.abortSignal.aborted) {
      throw new Error("Operation cancelled");
    }

    await processItem(largeDataset[i]);
  }
};
```

### 3. Make Handlers Idempotent (for Retries)

```typescript title="idempotent-example.ts"
// ✅ Good - safe to run multiple times
handler: async ({ email, message }) => {
  // Check if email already sent
  const existing = await emailLog.findByKey(`${email}-${hash(message)}`);
  if (existing) {
    return { status: "already_sent", messageId: existing.messageId };
  }

  // Send email and log it
  const result = await emailService.send(email, message);
  await emailLog.create({
    email,
    messageHash: hash(message),
    messageId: result.id,
  });
  return { status: "sent", messageId: result.id };
};

// ❌ Bad - creates duplicate emails if retried
handler: async ({ email, message }) => {
  const result = await emailService.send(email, message);
  return { status: "sent", messageId: result.id };
};
```

## Advanced: Custom Task Types

Most users won't need this, but you can define custom task types:

```typescript title="custom-task.ts"
import { task } from "@daydreamsai/core";

const processVideoTask = task(
  "agent:video:process",
  async (params: { videoUrl: string }, ctx) => {
    ctx.debug("processVideo", "Starting video processing", params);

    // Long-running video processing
    const result = await videoProcessor.process(params.videoUrl);

    return { processedUrl: result.url, duration: result.duration };
  },
  {
    retry: 2, // Retry twice on failure
  }
);

// Use it in your agent
agent.taskRunner.enqueueTask(processVideoTask, { videoUrl: "https://..." });
```

## Key Takeaways

* **Tasks happen automatically** - Your action handlers become tasks
* **Concurrency is controlled** - Default limit is 3 simultaneous tasks
* **Queuing prevents overload** - Extra tasks wait their turn
* **Write async handlers properly** - Use `async/await` and handle cancellation
* **Configure based on your APIs** - Increase limit for fast APIs, decrease for
  rate-limited ones

The task system ensures your agent performs well without overwhelming external
services or consuming excessive resources.


file: ./content/docs/core/extra-reading/container.mdx
meta: {
  "title": "container.ts"
}
        
This file provides a system called a "Dependency Injection (DI) Container",
created using `createContainer()`. Its main job is to manage shared resources or
services that different parts of your agent might need, like a connection to an
external API, a database client, or the agent's logger. It ensures these
resources are created correctly and makes them easily accessible wherever
needed.

## How to Use

You generally **don't create or directly interact** with the container yourself
using `createContainer()`. The Daydreams framework creates one automatically
when you call `createDreams`.

* **Registering:** Services (defined using the `service` helper) or Extensions
  use the container's `register`, `singleton`, or `instance` methods internally
  to tell the container *how* to create or find a specific resource (e.g.,
  "Here's how to make the database client"). `singleton` is common for resources
  you only want one of (like a database connection).
* **Accessing:** When your `action` handler (or other component) needs to use a
  shared resource managed by the container, you access it through the `agent`
  object: `agent.container.resolve<ResourceType>('resourceName')`. For example,
  to get the logger, you might use `agent.container.resolve<Logger>('logger')`.

## Benefit

The container decouples your code. Your action handler doesn't need to know
*how* to create the database client or logger; it just asks the container for it
by name (`'database'`, `'logger'`). This makes your code cleaner, easier to
test, and simplifies managing shared resources, especially within extensions. If
the way a resource is created changes, you only need to update its registration,
not every place it's used.

## Anticipated Questions

* *"Do I need to call `createContainer()`?"* No, the agent created by
  `createDreams` already includes a pre-configured container available at
  `agent.container`.
* *"How do things get into the container?"* Typically through `ServiceProvider`
  definitions (created with the `service` helper), which are often bundled
  within `Extension`s. The service's `register` method puts things into the
  container. Core framework components like the default `Logger` are also
  registered automatically.
* *"What's the difference between `register` and `singleton`?"* When
  registering, `singleton` ensures only *one instance* of the resource is ever
  created and shared. `register` creates a *new instance* every time `resolve`
  is called for that name (less common for shared resources).


file: ./content/docs/core/extra-reading/context.mdx
meta: {
  "title": "context.ts"
}
        
This file provides the essential `context` function, which you use to define
different "modes" or "workspaces" for your agent. Think of each context
definition as a blueprint for a specific task or interaction type, like handling
a chat conversation, managing a game, or performing a specific workflow. Each
active instance of a context (e.g., a specific chat session) gets its own
separate memory and state.

## How to Use

You'll typically define your contexts in separate files using the
`context({...})` function and then pass these definitions to `createDreams`. Key
things you define inside `context({...})`:

* `type`: A unique name for this type of context (e.g., `"chat"`,
  `"projectBoard"`).
* `schema`: (Using Zod) Defines the arguments needed to identify a *specific
  instance* of this context (e.g., `{ sessionId: z.string() }` for a chat).
* `create`: A function that returns the initial structure and default values for
  this context's persistent memory (`ctx.memory`). This runs the first time an
  instance is accessed.
* `render`: (Optional) A function that formats the current state (`ctx.memory`)
  of an instance into text (or XML) for the AI model to understand the current
  situation within that specific workspace.
* `actions`, `inputs`, `outputs`: (Optional, often added via `.setActions()`,
  etc.) Link specific tools (Actions), data sources (Inputs), and response
  methods (Outputs) directly to this context type.

## Benefit

Contexts allow your agent to manage multiple tasks or interactions
simultaneously without getting confused. Each context instance has its own
dedicated memory (`ctx.memory`) where it stores relevant information (like chat
history or task lists) persistently. The `render` function ensures the AI model
gets only the relevant state for the specific task it's working on at that
moment. Associating actions/inputs/outputs keeps your agent's capabilities
organized.

## Anticipated Questions

* *"What's the difference between context memory (`ctx.memory`) and working
  memory?"* `ctx.memory` is the *persistent* storage for a specific context
  instance (like chat history saved to a database). *Working memory* is
  *temporary* storage used during a single agent run cycle to track the steps
  (inputs, thoughts, actions) of that specific interaction.
* *"How do I identify a specific chat session if I have multiple?"* You use the
  `schema` you define to pass identifying arguments (like a `sessionId`) when
  calling `agent.run` or `agent.send`. The optional `key` function in the
  context definition helps create truly unique IDs if needed (e.g.,
  `chat:session-xyz`).
* *"How does the AI know what happened in this specific chat?"* The `render`
  function you define formats the relevant parts of `ctx.memory` (e.g., recent
  messages) and includes it in the prompt sent to the AI model for that specific
  context instance.


file: ./content/docs/core/extra-reading/dreams.mdx
meta: {
  "title": "dreams.ts"
}
        
This file provides the `createDreams` function, which is the main entry point
for building your Daydreams agent. Think of it as the constructor or blueprint
for your AI assistant. It takes all your configurations (like which AI model to
use, what tools it has, how it remembers things) and assembles them into a
ready-to-run agent.

## How to Use

You'll call `createDreams({...})` once in your project setup, passing it a
configuration object. This object specifies:

* `model`: Which language model (like OpenAI's GPT or Anthropic's Claude) the
  agent should use for thinking (using providers from the Vercel AI SDK).
* `extensions`: Pre-built packages of functionality (like Discord integration or
  file system access) you want your agent to have.
* `contexts`: Custom definitions for different tasks or conversations your agent
  needs to manage.
* `actions`: Custom tools or abilities you define for your agent.
* `memory`: How the agent should store and recall information (e.g., using
  in-memory storage or a database like MongoDB).
* *(and other optional configurations)*

The function returns an `agent` object. You'll then typically call
`await agent.start()` to initialize it and `agent.send(...)` or `agent.run(...)`
to give it tasks or information to process.

## Benefit

It provides a single, organized way to configure and initialize your entire
agent. Instead of manually wiring up all the different parts (model, memory,
tools), `createDreams` handles the setup and dependencies, letting you focus on
defining your agent's capabilities and behavior.

## Anticipated Questions

* *"Do I need to provide all configuration options?"* No, many options have
  sensible defaults (like basic memory storage). You typically only need to
  provide the `model` and any `extensions` or custom `actions`/`contexts` you
  want to use.
* *"What's the difference between `agent.send()` and `agent.run()`?"*
  `agent.send()` is typically used when an external event happens (like a user
  sending a message), providing the input data. `agent.run()` is the underlying
  method that processes information, reasons, and takes action; `send` usually
  calls `run` internally.
* *"Where do I define things like actions and contexts?"* You usually define
  them in separate files and import them into your main setup file where you
  call `createDreams`.


file: ./content/docs/core/extra-reading/formatters.mdx
meta: {
  "title": "formatters.ts"
}
        
This file contains helper functions that translate the agent's internal data
(like your action definitions, context state, and logs) into the structured XML
format the AI model expects to see in its prompt. It also helps format Zod
schemas into JSON schemas for the prompt.

## How it Affects You

You don't need to call functions like `formatAction` or `formatContextState`
directly. The framework uses them automatically when preparing the prompt for
the AI model during each step of an `agent.run`. For example:

* When you define an `action` with a description and schema, `formatAction`
  converts that definition into the `<action>` XML block seen in the prompt.
* When you define a `render` function for your `context`, the output of your
  function is placed inside the `<state>` tag within the `<context>` XML block
  generated by `formatContextState`.
* The `formatSchema` function ensures the Zod schemas you define for actions,
  outputs, etc., are translated into a format the AI model can understand within
  the prompt's `<schema>` tags.

## Benefit

These formatters ensure that all the information the agent needs to give the AI
model (available tools, current state, recent history) is presented in a
consistent, structured way (XML) that the model is trained to understand. This
standardization makes the communication between your agent's code and the AI
model reliable. You don't have to worry about manually creating complex XML
prompts.

## Anticipated Questions

* *"Do I need to write XML?"* No. You define your components using
  JavaScript/TypeScript objects (via helpers like `action`, `context`, etc.).
  These formatters handle the conversion to XML automatically before sending the
  prompt to the AI.
* *"Why does Daydreams use XML in prompts?"* XML provides a clear way to
  structure complex information (like nested states, lists of tools with
  descriptions and schemas) for the AI model, making it easier for the model to
  parse and understand the different parts of the prompt.
* *"What is the `render` function in this file used for?"* It's primarily used
  internally by the framework to assemble the main prompt template by inserting
  the formatted XML blocks (like actions, contexts, logs) into the correct
  placeholders.


file: ./content/docs/core/extra-reading/handlers.mdx
meta: {
  "title": "handlers.ts"
}
        
This file holds the internal "handlers" that the Daydreams agent uses during its
execution cycle (`agent.run`). When the agent receives input, or when the AI
model decides to call an action or send an output, the functions in this file
are responsible for processing those requests correctly. Think of it as the
agent's internal dispatcher and validator.

## How it Affects You

You don't call functions from this file directly. It works behind the scenes,
but it's where several important things happen based on how you defined your
actions, inputs, and outputs:

* **Validation:** When the AI model provides arguments for your `action` or
  content/attributes for your `output`, the code here validates that data
  against the `schema` you defined using Zod. If the validation fails, it
  prevents your `handler` code from running with bad data.
* **Parsing:** It parses the arguments/content provided by the AI model (which
  might be in JSON or XML format) into a usable JavaScript object/value before
  passing it to your `handler`.
* **Template Resolution:** If you use templates like `{{calls[0].someValue}}` in
  your action arguments (as described in [Prompting](/docs/concepts/prompting)),
  the `resolveTemplates` function here handles resolving those values *before*
  your action's `handler` is called.
* **Handler Execution:** It prepares the necessary context (including the
  correct memory scopes like `ctx.memory` or `ctx.actionMemory`) and then calls
  the specific `handler` function you wrote in your `action`, `input`, or
  `output` definition. For actions, it uses the `TaskRunner` to queue the
  execution.
* **Error Handling:** It defines specific errors like `NotFoundError` (if the AI
  calls a non-existent action/output) and `ParsingError` (if validation fails).

## Benefit

These handlers ensure that the interaction between the AI model's requests and
your custom code (in action/output/input handlers) is safe, validated, and
correctly contextualized. It bridges the gap between the AI's structured text
output and the execution of your JavaScript/TypeScript functions, handling
potential errors and data transformations along the way.

## Anticipated Questions

* *"Is this where my `action`'s `handler` function actually runs?"* Yes,
  functions in this file (specifically `handleActionCall` which uses `runAction`
  from `tasks/index.ts`) are responsible for preparing the context and
  ultimately calling the `handler` you defined for your action (via the
  `TaskRunner`).
* *"What happens if the AI provides arguments that don't match my action's Zod
  schema?"* The validation logic within `prepareActionCall` in this file will
  catch the mismatch, throw a `ParsingError`, and prevent your action's
  `handler` from being called with invalid data.
* *"How does the agent know which specific context's memory (`ctx.memory`) to
  give my action handler?"* The logic here (within functions like
  `prepareActionCall` and `handleOutput`) identifies the correct `ContextState`
  based on the current run and makes its `memory` available in the `ctx` object
  passed to your handler.


file: ./content/docs/core/extra-reading/http.mdx
meta: {
  "title": "http.ts"
}
        
This file provides a convenient helper object named `http` for making network
requests to external APIs or web services from within your agent's actions. It's
essentially a smarter version of the standard web `fetch` command.

## How to Use

When you write an `action` handler that needs to fetch data from or send data to
an external API, you can import and use this `http` object.

* For simple GET requests expecting JSON data:

  ```typescript
  import { http } from "@daydreamsai/core";

  // Inside an action handler:
  try {
    const data = await http.get.json<{ someField: string }>(
      "https://api.example.com/data?id=123"
    );
    console.log(data.someField);
    return { success: true, result: data };
  } catch (error) {
    console.error("API call failed:", error);
    return { success: false, error: "API failed" };
  }
  ```

* For POST requests sending JSON data:

  ```typescript
  import { http } from "@daydreamsai/core";

  // Inside an action handler:
  const payload = { name: "Widget", value: 42 };
  try {
    const response = await http.post.json(
      "https://api.example.com/create",
      payload
    );
    return { success: true, id: response.id };
  } catch (error) {
    // ... handle error ...
  }
  ```

* It also includes helpers for specific protocols like `http.jsonrpc(...)` and
  `http.graphql(...)`.

## Benefit

* **Automatic Retries:** The key benefit is built-in automatic retries. If a
  network request fails due to a temporary network issue or a specific server
  error (like 500 or 503), the `http` helper will automatically wait a bit and
  try the request again a few times before giving up. This makes your actions
  more resilient to temporary glitches.
* **Convenience:** Provides shortcuts for common tasks like setting JSON
  headers, parsing JSON responses, and adding query parameters (`params`
  option).

## Anticipated Questions

* *"Do I have to use this instead of `fetch`?"* No, you can still use the
  standard `fetch` API directly in your actions if you prefer. However, using
  the `http` helper gives you the automatic retry logic for free.
* *"How do I set custom headers (like Authorization)?"* You can pass standard
  `fetch` options (like `headers`) as the last argument to the `http` methods
  (e.g.,
  `http.get.json(url, params, { headers: { 'Authorization': 'Bearer ...' } })`).


file: ./content/docs/core/extra-reading/introduction.mdx
meta: {
  "title": "introduction"
}
        
# The Git-Gud Guide to Daydreams

This started out as a collection of notes from a hobbyist developer trying to
understand the `@daydreamsai/core` package more deeply. The goal isn't to be an
exhaustive API reference, but rather a practical guide – "extra reading" – to
help you grasp the purpose and role of the key TypeScript files that make up the
core framework.

## What's Here?

Each page in this section dives into a specific Typescript file from the core
library. You'll find explanations focusing on:

* **What it is:** A high-level description of the file's purpose.
* **How it Affects You / How to Use:** Practical information on whether you
  interact with it directly and how it fits into building your agent.
* **Benefit:** Why this component exists and what advantages it offers.
* **Anticipated Questions:** Answers to common questions a developer might have
  when encountering this part of the framework.

## How to Approach It

Think of these pages as supplementary material to the main concepts and
tutorials. If you're wondering *why* something works the way it does in
Daydreams, or what's happening under the hood when you make a call or define an
action, browsing the relevant file explanations here might provide valuable
context.

You can start by using the search or dive into specific files as you encounter
them in your development.


file: ./content/docs/core/extra-reading/logger.mdx
meta: {
  "title": "logger.ts"
}
        
This file provides the `Logger` class used throughout the Daydreams framework
for recording informational messages, warnings, and errors that occur during
agent execution. It helps you understand what your agent is doing and diagnose
problems.

## How to Use

You don't typically create a `Logger` instance yourself. The agent object
returned by `createDreams` already has a pre-configured logger available at
`agent.logger`. You use this instance inside your `action` handlers, `context`
lifecycle methods, or `service` definitions to log relevant information:

```typescript
import {
  action,
  type ActionCallContext,
  type AnyAgent,
} from "@daydreamsai/core";

export const myAction = action({
  name: "processData",
  // ... schema ...
  async handler(args, ctx: ActionCallContext, agent: AnyAgent) {
    // Log informational message
    agent.logger.info("processData:handler", "Starting data processing", {
      inputArgs: args,
    });

    try {
      // ... do some work ...
      const result = { status: "completed" };
      // Log successful completion (at debug level)
      agent.logger.debug("processData:handler", "Processing successful", {
        result,
      });
      return result;
    } catch (error) {
      // Log an error
      agent.logger.error("processData:handler", "Processing failed!", {
        error,
      });
      throw error; // Re-throw or handle error
    }
  },
});
```

* Common methods are `agent.logger.info()`, `agent.logger.warn()`,
  `agent.logger.error()`, `agent.logger.debug()`, and `agent.logger.trace()`.
* Each method takes a `context` string (often the function/component name), a
  `message` string, and optional `data` object.

## Benefit

Provides a standard way to record what's happening inside your agent. This is
crucial for:

* **Debugging:** Seeing the flow of execution, variable values, and errors.
* **Monitoring:** Understanding how your agent is performing in production.
* **Auditing:** Keeping a record of important events or decisions. The default
  logger prints messages to the console with timestamps, levels, and context,
  making it easy to follow along.

## Anticipated Questions

* *"How can I change the logging level (e.g., see DEBUG messages)?"* You can set
  the `logLevel` option when calling `createDreams`. For example:
  `createDreams({ ..., logLevel: LogLevel.DEBUG })`. The levels are `ERROR`,
  `WARN`, `INFO`, `DEBUG`, `TRACE` (most verbose).
* *"Can I send logs somewhere other than the console?"* Yes, the logger is
  designed with "transports". While the default is `ConsoleTransport`, you could
  potentially implement custom transports (though this is an advanced topic not
  covered here) and provide them via the `logger` or `transports` option in
  `createDreams`.
* *"Why provide a `context` string (like `'processData:handler'`)?"* It helps
  identify *where* in the code the log message originated, which is very useful
  for debugging complex agents.


file: ./content/docs/core/extra-reading/memory.mdx
meta: {
  "title": "memory.ts"
}
        
These files define the agent's memory system. `base.ts` provides the fundamental
building blocks: `MemoryStore` for saving and loading the persistent state of
your contexts (like chat history), and `VectorStore` for storing "episodic
memories" (learned experiences) using vector embeddings for later recall.
`utils.ts` contains helpers, primarily for automatically generating those
episodic memories using an LLM.

## How to Use

You configure the agent's memory system via the `memory` option when calling
`createDreams`.

* You typically provide implementations for `MemoryStore` and `VectorStore`.
* The core package provides simple defaults: `createMemoryStore()` (stores data
  in memory, lost on restart) and `createVectorStore()` (does nothing).
* For real persistence, you'll import and use implementations from other
  Daydreams packages, like `@daydreamsai/mongo` for MongoDB
  (`createMongoMemoryStore`) or `@daydreamsai/chroma` for ChromaDB
  (`createChromaVectorStore`).
* The `createMemory` function (exported from `base.ts`) is used to bundle your
  chosen store implementations together for the `memory` option.

```typescript
import { createDreams, createMemory } from '@daydreamsai/core';
// Import specific store implementations
import { createMongoMemoryStore } from '@daydreamsai/mongo';
import { createChromaVectorStore } from '@daydreamsai/chroma';

const agent = createDreams({
  model: /* ... */,
  memory: createMemory(
    // Use MongoDB for context state
    await createMongoMemoryStore({ uri: 'mongodb://...' }),
    // Use ChromaDB for episodic memory/vector search
    createChromaVectorStore('my-agent-episodes')
  ),
  // Optional: Enable automatic episodic memory generation
  // generateMemories: true,
  // vectorModel: openai('text-embedding-3-small') // Model for embeddings
});
```

* Episodic memory generation (from `utils.ts`) happens automatically in the
  background if you set `generateMemories: true` in the agent config and provide
  a `VectorStore`.

## Benefit

Allows your agent to have both persistent state (remembering conversations or
task progress across restarts via `MemoryStore`) and the ability to learn from
past interactions (recalling relevant experiences via `VectorStore` and episodic
memory). You can choose storage backends suitable for your needs (simple
in-memory for testing, robust databases for production).

## Anticipated Questions

* *"Do I need both MemoryStore and VectorStore?"* `MemoryStore` is essential for
  saving the state of your `context` instances (like `ctx.memory`).
  `VectorStore` is only needed if you want the agent to use episodic memory
  (learning from past interactions using embeddings). You can use the default
  `createVectorStore()` if you don't need episodic memory.
* *"What is episodic memory?"* It's a feature where the agent summarizes
  sequences of thought -> action -> result into "episodes". These are stored as
  vector embeddings. When the agent encounters a new situation, it can search
  its `VectorStore` for similar past episodes to potentially inform its current
  reasoning. (Requires `generateMemories: true` and a `VectorStore`).
* *"Where does `ctx.memory` get saved?"* The agent automatically saves the
  `memory` property of your `ContextState` instances to the configured
  `MemoryStore` at the end of each run cycle.


file: ./content/docs/core/extra-reading/package-managers.mdx
meta: {
  "title": "package managers"
}
        
It's worth mentioning the role of a good package manager, especially for rapid
development and monorepos. Wondering which one to use? The simple answer:
**[Bun](https://bun.sh/package-manager)**

## **Why?**

For the hobbyist developer, Bun offers several compelling advantages:

* **Speed:** Bun reduces wait time for installing dependencies, running scripts,
  and starting your application/agent.

* **Simplicity:** Bun acts as a runtime, package manager, bundler, and test
  runner rolled into one. This eliminates the need to learn, configure, and
  manage multiple separate tools. Keep it clean.

* **Ease of Use:** No more needing separate compilation steps (`tsc`) before
  running your code (`node index.js`). Bun runs TypeScript directly.

Essentially, Bun lets hobbyists focus more on building cool things and less on
wrangling complex development toolchains.


file: ./content/docs/core/extra-reading/prompt.mdx
meta: {
  "title": "prompt.ts"
}
        
This file offers general tools for working with prompt templates and parsing
structured (XML) responses, separate from the main agent prompt defined in
`prompts/main.ts`. It provides `createPrompt` for making reusable prompt
templates and `createParser` for defining how to extract data from XML text into
a specific JavaScript object structure.

## How to Use

While the core agent loop uses its own specific prompt, you might use these
helpers in more advanced scenarios, perhaps within an `action` handler:

* `createPrompt`: If an action needs to call *another* LLM for a sub-task, you
  could use `createPrompt` to define a reusable template for that specific
  sub-task prompt.

  ```typescript
  import { createPrompt } from "@daydreamsai/core";

  const summarizeTemplate = createPrompt<{ textToSummarize: string }>(
    "Please summarize the following text concisely:\n{{textToSummarize}}"
  );

  // Later, in an action handler:
  const subTaskPrompt = summarizeTemplate({ textToSummarize: someLongText });
  // const summary = await callAnotherLLM(subTaskPrompt);
  ```

* `createParser`: If an action receives a complex XML response from an external
  system (or perhaps even from a specialized LLM call), you could use
  `createParser` to define precisely how to extract the necessary data from the
  XML tags into a structured JavaScript object.

## Benefit

Provides flexible utilities for developers who need to implement custom prompt
generation or response parsing logic within their actions or extensions, beyond
the standard agent interaction loop. `createPrompt` helps manage reusable prompt
strings, and `createParser` offers a structured way to handle custom XML parsing
needs.

## Anticipated Questions

* *"Is this the main prompt the agent uses?"* No, the main prompt template and
  its formatting logic are primarily defined in
  `packages/core/src/prompts/main.ts`. This file (`prompt.ts`) provides more
  general, optional tools for custom prompt/parsing scenarios.
* *"When would I need `createParser`?"* It's less common, but potentially useful
  if an action interacts with a system that returns data in a specific XML
  format, and you want a structured way to extract information based on tag
  names.


file: ./content/docs/core/extra-reading/providers-api.mdx
meta: {
  "title": "providers/api.ts"
}
        
This file provides helper functions for interacting with external APIs within
your agent's actions or services. The main exported function is `fetchGraphQL`,
designed specifically to simplify making requests to GraphQL APIs.

## How to Use

If you need to query a GraphQL endpoint from an `action` handler, you can import
`fetchGraphQL` from `@daydreamsai/core`.

```typescript
import { action, fetchGraphQL } from "@daydreamsai/core";
import type { AnyAgent, ActionCallContext } from "@daydreamsai/core";

const GRAPHQL_ENDPOINT = "https://api.example.com/graphql";

interface UserData {
  user: { id: string; name: string };
}

export const getUserAction = action({
  name: "getUserData",
  schema: z.object({ userId: z.string() }),
  async handler(args, ctx: ActionCallContext, agent: AnyAgent) {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `;
    const variables = { id: args.userId };

    try {
      const result = await fetchGraphQL<UserData>(
        GRAPHQL_ENDPOINT,
        query,
        variables
      );

      if (result instanceof Error) {
        agent.logger.error("getUserAction", "GraphQL query failed", {
          error: result.message,
        });
        return { success: false, error: result.message };
      }

      agent.logger.info("getUserAction", "Got user data", {
        user: result.user,
      });
      return { success: true, userData: result.user };
    } catch (error) {
      agent.logger.error("getUserAction", "Fetch failed", { error });
      return { success: false, error: "Network error" };
    }
  },
});
```

## Benefit

`fetchGraphQL` handles the boilerplate of setting up a GraphQL POST request
(setting headers, stringifying the query and variables). It also provides basic
error handling, returning an `Error` object if the GraphQL response indicates
errors, which you can check for using `instanceof Error`. This makes interacting
with GraphQL APIs from your actions cleaner and less error-prone than using
`fetch` directly for this specific case.

## Anticipated Questions

* *"Is there a helper for REST APIs?"* While `api.ts` contains a `fetchRest`
  function, it doesn't seem to be exported directly via `@daydreamsai/core`. For
  general REST calls, you would typically use the `http` helper object (from
  `http.ts`) which provides automatic retries, or the standard `fetch` API.
* *"How does this differ from the `http` helper?"* The `http` object provides
  general-purpose HTTP request helpers (GET, POST, JSON) with automatic retries.
  `fetchGraphQL` is specifically tailored for the GraphQL protocol, formatting
  the request body correctly and performing basic GraphQL-specific error checks
  on the response.


file: ./content/docs/core/extra-reading/serviceProvider.mdx
meta: {
  "title": "serviceProvider.ts"
}
        
This file provides the `service` helper function, which you use to define how
shared resources or external clients (like an API client, database connection,
or special utility) should be managed by the Daydreams framework. It ensures
these services are set up correctly and are ready to use when your agent needs
them.

## How to Use

You typically define a service in its own file using `service({...})` and then
include it in an `Extension`. Inside the `service({...})` call, you can define:

* `register(container)`: (Optional) A function where you tell the agent's DI
  Container (`agent.container`) how to create this service instance. Often,
  you'll use
  `container.singleton('serviceName', () => new MyServiceClient(...))` here to
  ensure only one instance is created.
* `boot(container)`: (Optional) An `async` function where you perform any
  necessary initialization *after* all services have been registered (e.g.,
  connecting to the API using credentials maybe resolved from the container).
  This runs when `agent.start()` is called.

```typescript
import { service, type Container } from "@daydreamsai/core";

// Assume MyApiClient class exists
declare class MyApiClient {
  constructor(config: { url: string });
  connect(): Promise<void>;
}

export const myApiService = service({
  register(container: Container) {
    // Tell the container how to create the client (as a singleton)
    container.singleton(
      "myApiClient",
      () => new MyApiClient({ url: "https://api.example.com" })
    );
  },
  async boot(container: Container) {
    // Initialize the client after registration
    const client = container.resolve<MyApiClient>("myApiClient");
    await client.connect();
    console.log("My API Client connected!");
  },
});

// Typically, you would then include `myApiService` in an extension's `services` array.
```

## Benefit

Defining services this way ensures proper setup and teardown, especially for
resources needing asynchronous initialization (`boot`). It integrates smoothly
with the DI Container, making services easily accessible via
`agent.container.resolve('serviceName')` in your actions or other components,
without them needing to know the setup details. Bundling services in Extensions
makes them reusable.

## Anticipated Questions

* *"When should I use a `service` vs just putting logic in an `action`?"* Use a
  `service` for shared, reusable components, especially those managing
  connections to external systems or requiring specific setup/initialization
  steps (`boot`). Actions are better for defining specific *tasks* the agent can
  perform, which might *use* one or more services obtained from the container.
* *"What's the difference between `register` and `boot`?"* `register` runs first
  and only tells the container *how* to create the service. `boot` runs later
  (during `agent.start()`) and performs the actual initialization (like
  connecting), potentially using other services that were registered earlier.
* *"Do I need to call `createServiceManager()`?"* No, this is handled internally
  by `createDreams`. You just define your services using the `service` helper.


file: ./content/docs/core/extra-reading/tasks.mdx
meta: {
  "title": "task.ts"
}
        
These files define the system (`TaskRunner`) that manages how your agent runs
asynchronous operations, especially the `handler` functions inside your custom
`action` definitions. Think of it as a queue manager that prevents your agent
from trying to do too many things at once, particularly when actions involve
waiting for external APIs or services.

## How it Affects You

You don't directly use the `TaskRunner` or the `task` function yourself.
However, its existence impacts how you write your `action` handlers:

* **Concurrency:** By default, the agent only runs a few action handlers
  simultaneously (e.g., 3). If the AI model asks the agent to perform many
  actions quickly, some will wait in a queue managed by the `TaskRunner` before
  they start executing. This prevents overwhelming external services.
* **Asynchronous Code:** Because actions are run through this system, your
  `action` handlers **must** use `async` and `await` correctly if they perform
  any operations that take time (like network requests `fetch`, database calls,
  or even just `setTimeout`). The `TaskRunner` waits for the `Promise` returned
  by your `async handler` to finish.
* **Retries:** You can add a `retry` option when defining an `action`. If the
  action's handler fails (throws an error), the `TaskRunner` will automatically
  try running it again a few times. If you use this, try to make your handler
  logic *idempotent* (safe to run multiple times with the same input).
* **Cancellation:** Long-running actions should check for cancellation signals.
  Inside your `action` handler, the `ctx` object contains an `abortSignal`. You
  should check `ctx.abortSignal.aborted` periodically in long loops or
  before/after long waits and stop execution if it's `true`. This allows the
  agent's overall run to be cancelled cleanly if needed.

## Benefit

The `TaskRunner` automatically handles concurrency limits and retries for your
actions, making your agent more stable and preventing it from accidentally
overloading external systems you interact with. It ensures asynchronous
operations are managed correctly within the agent's lifecycle.

## Anticipated Questions

* *"Do I need to create a `TaskRunner`?"* No, `createDreams` creates one for you
  automatically with default settings.
* *"How do I know when my action handler actually runs?"* It runs shortly after
  the AI model calls the action, but it might be delayed slightly if the
  `TaskRunner`'s queue is busy with other actions. Use `agent.logger` inside
  your handler to see when it starts and finishes.
* *"What if my action needs to run for a very long time?"* Make sure to
  implement the cancellation check using `ctx.abortSignal.aborted` so the agent
  can stop it if necessary.


file: ./content/docs/core/extra-reading/types.mdx
meta: {
  "title": "types.ts"
}
        
This file acts as the central dictionary for all the data structures used within
the Daydreams framework. It defines the specific "shape" (using TypeScript types
and interfaces) that different pieces of data should have, such as what
information defines an `Action`, what goes into a `Context`, or what the `Agent`
object looks like.

## How to Use

You generally **don't need to change** this file. However, you'll interact with
the types defined here frequently when writing your agent code:

* **Type Hints:** When defining the `handler` for your `action`, `input`, or
  `output`, you'll often use types imported from `@daydreamsai/core` (which
  ultimately come from this file) to get auto-completion and type safety for the
  arguments passed to your function (like the `args`, `ctx`, and `agent`
  parameters).

  ```typescript
  import {
    action,
    type ActionCallContext,
    type AnyAgent,
  } from "@daydreamsai/core";
  import { z } from "zod";

  // Define the memory structure for a specific context
  interface MyChatMemory {
    history: { role: "user" | "agent"; text: string }[];
  }

  // Use ActionCallContext with your memory type for the 'ctx' parameter
  export const myAction = action({
    name: "reply",
    schema: z.object({ message: z.string() }),
    handler: async (
      args,
      ctx: ActionCallContext<any, any, MyChatMemory>,
      agent: AnyAgent
    ) => {
      // Now, ctx.memory is correctly typed as MyChatMemory
      ctx.memory.history.push({ role: "agent", text: args.message });
      // agent parameter is typed as AnyAgent
    },
  });
  ```

* **Defining Memory:** When you define a `context`, you'll often create an
  `interface` for its specific memory structure (like `MyChatMemory` above).
  This interface defines the shape of the data stored in `ctx.memory` for that
  context.

* **Understanding Logs:** If you work with the detailed execution logs
  (`agent.run` results), the types like `InputRef`, `OutputRef`, `ActionCall`,
  `ActionResult`, `Thought` define the structure of each log entry.

## Benefit

Using the types defined here makes your code safer and easier to write. Your
code editor can provide helpful auto-completion and immediately warn you if
you're using a component incorrectly (e.g., trying to access a property that
doesn't exist on the `ctx` object or passing the wrong type of argument to an
action). It acts as a form of documentation, clarifying what data is available
where.

## Anticipated Questions

* *"Do I need to import types directly from `types.ts`?"* No, you should import
  types directly from the main package entry point:
  `import type { Action, Context, Agent } from '@daydreamsai/core';`.
* *"There are so many types! Which ones are most important?"* The most common
  ones you'll likely encounter when building your agent are `Agent`, `Context`,
  `Action`, `Input`, `Output`, `ActionCallContext`, `ContextState`,
  `WorkingMemory`, `MemoryStore`, `VectorStore`, and the various `Ref` types
  (`InputRef`, `OutputRef`, etc.) if you inspect execution logs. Many others are
  for internal framework use.
* *"I see types like `AnyAction`. Is it easier to use those instead of specific
  ones like `Action<MySchema, ...>`?"* While using `AnyAction` might seem
  simpler because you don't need to specify detailed types, it's generally **not
  recommended**, especially when starting out. Using specific types gives you
  significant advantages:

  1. **Type Safety:** TypeScript can check your code for errors *before* you
     run it (e.g., did you misspell a property name in `ctx.memory`? Are you
     using the action's `args` correctly?). `AnyAction` turns these checks off,
     leading to potential runtime bugs that are harder to find.
  2. **Auto-completion:** Your code editor can provide helpful suggestions for
     properties and methods when you use specific types, making coding faster
     and reducing typos. This doesn't work well with `AnyAction`.
  3. **Clarity:** Specific types make your code easier to understand for
     yourself and others. It clearly shows what data an action expects and
     uses.

  It's better practice to define Zod schemas for action arguments and interfaces
  for context memory, then use those in your definitions (e.g.,
  `Action<typeof mySchema, MyResult, MyMemoryInterface>`).


file: ./content/docs/core/extra-reading/utils.mdx
meta: {
  "title": "utils.ts"
}
        
This file provides essential "factory" functions that you use to define the
building blocks of your Daydreams agent, such as its tools (Actions), how it
receives information (Inputs), how it responds (Outputs), how it remembers
things specifically for an action (Memory), and how you bundle features together
(Extensions).

## How to Use

You'll import these functions directly from `@daydreamsai/core` when defining
your agent's components, typically in separate files.

* `action({...})`: Use this to define a specific capability or tool for your
  agent. You give it a `name`, `description`, expected arguments (`schema` using
  Zod), and the `handler` code that runs when the AI decides to use this tool.
  (See [Actions](/docs/concepts/actions) for details).

  ```typescript
  import { action } from "@daydreamsai/core";
  import { z } from "zod";

  export const myAction = action({
    name: "myTool",
    description: "Does something cool.",
    schema: z.object({ param: z.string() }),
    handler: async (args, ctx, agent) => {
      /* ... */
    },
  });
  ```

* `input({...})`: Use this to define how your agent receives information from
  the outside world (like a chat message or an API event). You specify how to
  `subscribe` to the source and how to `send` incoming data into the agent for
  processing. (See [Inputs](/docs/concepts/inputs)).

* `output({...})`: Use this to define how your agent sends information out (like
  replying to a chat). You give it a `type`, expected content structure
  (`schema`), and the `handler` code that performs the sending. (See
  [Outputs](/docs/concepts/outputs)).

* `extension({...})`: Use this to package related actions, inputs, outputs,
  contexts, and services together into a reusable module. You provide a `name`
  and arrays/objects containing the components this extension provides. (See
  [Services & Extensions](/docs/advanced)).

* `memory({...})`: A specialized helper used within an `action` definition if
  that specific action needs its own persistent memory across different calls
  (less common than context memory). You provide a `key` and a `create` function
  for its initial state.

## Benefit

These functions provide a standardized way to define the different parts of your
agent. They ensure all the necessary configuration details are provided and
integrate smoothly with the agent's lifecycle and the AI model. They abstract
away the internal wiring, letting you focus on the logic of your agent's
capabilities.

## Anticipated Questions

* *"Do I use these functions inside `createDreams`?"* No, you typically use
  these functions in separate files to define your actions, inputs, etc., and
  then you import those definitions and pass them *to* `createDreams` in its
  configuration object (e.g., in the `actions: [...]` or `extensions: [...]`
  arrays).
* *"What's the difference between `action` and `output`?"* Use `action` when the
  agent needs to perform a task and get a result back to continue thinking (like
  looking up information). Use `output` when the agent just needs to send
  information out (like sending a final reply message).
