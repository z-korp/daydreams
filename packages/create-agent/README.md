# @daydreamsai/create-agent

A CLI tool to bootstrap Daydreams agents easily.

## Usage

```bash
# Using npx (recommended)
npx @daydreamsai/create-agent my-agent

# Or install globally
npm install -g @daydreamsai/create-agent
create-agent my-agent
```

## Options

You can specify extensions to include:

```bash
npx @daydreamsai/create-agent my-agent --twitter --discord --cli
```

Available extensions:

- `--cli`: Include CLI extension
- `--twitter`: Include Twitter extension
- `--discord`: Include Discord extension
- `--telegram`: Include Telegram extension
- `--all`: Include all extensions

If no extensions are specified, you will be prompted to select which ones to include.

## What it does

This tool:

1. Creates a new directory for your agent (or uses the current directory)
2. Sets up a package.json with the necessary dependencies
3. Creates an index.js file with the selected extensions
4. Generates a basic .env.example file with required environment variables
5. Installs all dependencies

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Test the CLI locally
npm run dev
```
