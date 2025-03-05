# Gigaverse Terminal UI

This project provides a terminal-based user interface for the Gigaverse game,
allowing you to play the rock-paper-scissors dungeon crawler game through a
terminal interface.

## Features

- Real-time game state visualization
- Player stats display
- Enemy information display
- Colorized logs for different message types
- Agent action tracking
- Rock-Paper-Scissors battle visualization

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Set up environment variables: Create a `.env` file in the root directory with
   the following variables:

   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GIGA_TOKEN=your_gigaverse_token
   ```

3. Run the application:
   ```
   npx ts-node examples/v1/gigaverse-ui.ts
   ```

## UI Options

We provide two different terminal UI options:

### 1. Rich Terminal UI (blessed-based)

The rich UI uses the `blessed` library to create a more interactive terminal
experience with panels and windows.

To run the rich UI:

```
npx ts-node examples/v1/gigaverse-ui.ts
```

**Features:**

- Multiple panels for different information
- Keyboard navigation for logs (Up/Down arrows)
- Detailed game state visualization

**Note:** If you experience display issues with the rich UI, try the simple UI
option below.

### 2. Simple Terminal UI

The simple UI uses basic ANSI color codes and standard terminal output for a
more compatible experience across different terminal emulators.

To run the simple UI:

```
npx ts-node examples/v1/gigaverse-simple-ui.ts
```

**Features:**

- Color-coded output using standard ANSI colors
- Works in virtually any terminal
- No special terminal capabilities required
- Clear section headers for different types of information

### Testing the UI

You can test either UI without connecting to the actual game using our test
scripts:

For the rich UI:

```
npx ts-node examples/v1/test-ui.ts
```

For the simple UI:

```
npx ts-node examples/v1/test-simple-ui.ts
```

## Controls

### Rich UI Controls

- **Up/Down Arrow Keys**: Scroll through logs
- **Ctrl+C**: Exit the application

### Simple UI Controls

- **Ctrl+C**: Exit the application

## Architecture

The UI is integrated with the Gigaverse agent, which uses the Daydreams AI
framework to make decisions in the game. The agent communicates with the
Gigaverse API to perform actions and receive game state updates.

The UI components are responsible for:

1. Displaying game state information
2. Showing player stats
3. Presenting enemy information
4. Logging agent actions and their results
5. Visualizing Rock-Paper-Scissors battles

## Customization

You can customize the UI by modifying the following files:

- `terminal-ui.ts`: For the rich UI layout and styling
- `simple-ui.ts`: For the simple UI colors and formatting
- `gigaverse-ui.ts` or `gigaverse-simple-ui.ts`: For agent integration and API
  calls

## Troubleshooting

### Rich UI Issues

If you experience issues with the rich UI such as:

- Overlapping text
- UI corruption
- Black screen
- Random characters appearing when moving the mouse

Try the following solutions:

1. Use the simple UI instead (`npx ts-node examples/v1/gigaverse-simple-ui.ts`)
2. Restart your terminal
3. Try a different terminal emulator
4. Ensure your terminal supports the required capabilities

### Simple UI Issues

If you experience issues with the simple UI:

1. Ensure your terminal supports ANSI color codes
2. Try running with `FORCE_COLOR=1` environment variable:
   ```
   FORCE_COLOR=1 npx ts-node examples/v1/gigaverse-simple-ui.ts
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
