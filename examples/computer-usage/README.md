# Computer Automation with Daydreams

This module provides a set of actions for automating computer interactions using the Daydreams AI framework. You can control the mouse, keyboard, take screenshots, and manage windows programmatically.

## Prerequisites

Before you begin, ensure you have:

- Node.js 18 or newer
- The following environment variables:
  - `ANTHROPIC_API_KEY`: Your API key for Anthropic's Claude model

## Installation

Install the required dependencies:

```bash
npm install @daydreamsai/core @ai-sdk/anthropic robotjs sharp screenshot-desktop uuid
```

## Available Actions

### Mouse Control

- **takeScreenshot**: Capture the current screen state
- **moveMouse**: Position the cursor at specific coordinates
- **clickMouse**: Perform mouse clicks (left, right, or middle button)
- **moveAndClick**: Move the cursor to specific coordinates and click in one operation
- **dragMouse**: Click and drag from current position to target coordinates
- **scrollMouse**: Scroll up, down, left, or right
- **getCursorPosition**: Retrieve current mouse coordinates

### Keyboard Control

- **typeText**: Enter text at the current cursor position
- **pressKey**: Execute specific key presses or combinations

### Window Management

- **focusWindow**: Bring a specific window to the foreground
- **resizeWindow**: Change window dimensions

## Usage Example

```typescript
import { createDreams, validateEnv } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import {
  takeScreenshotAction,
  moveMouseAction,
  clickMouseAction,
} from "./computer-actions";

// Validate environment variables
validateEnv(
  z.object({
    ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),
  })
);

async function main() {
  const agent = await createDreams({
    model: anthropic("claude-3-5-sonnet-20240620"),
    extensions: [cli],
    actions: [takeScreenshotAction, moveMouseAction, clickMouseAction],
  }).start();

  console.log("Computer automation actions are now available!");
}

main().catch(console.error);
```

## How It Works

These actions build on the `ComputerTool` class from `base.ts`, which provides core functionality for operating system interaction. The actions integrate seamlessly with the Daydreams AI framework, making it easy to add computer automation to your AI agents.

## Security Notice

**Warning:** These actions directly control your computer's mouse and keyboard. Use them cautiously, especially with scripts from untrusted sources. Always review automation code before execution.

## Common Use Cases

- Automating repetitive tasks
- Creating AI assistants that can interact with desktop applications
- Building testing frameworks for GUI applications
- Developing accessibility tools

## License

This project is licensed under the terms included in the repository.
