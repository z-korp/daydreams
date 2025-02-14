# zIdle AI Agent

This project is a fork of the Daydreams framework, featuring an AI agent that can play the FOCG game Zidle. The agent is capable of performing various in-game actions and interacting with the user via a chat interface.

## Setup and run
1. Environment Setup
- Copy .env.example.zidle to .env.
- Add your LLM API key (Anthropic is preferred).

2.	Install Dependencies
Run the following command in the project root:
- `pnpm install`

3.	Start the Agent
To run the agent in the default mode:
- `bun zidle`

To run the chat-integrated version:
- `bun zidle-chat`

## Examples
### zidle
In this example, the agent attempts to achieve three goals within its current arena:
1. Harvest 50 gold
2. Harvest 50 pine
3. Harvest 50 berries

## zidle-chat
This version wires the chat interface to the agent, enabling real-time interaction. You can:
- Ask for game data (e.g., “How much XP is required to reach level 10 mining?”)
- Execute game actions (e.g., “Sell 50 berries for gold”)
- Instruct the agent to achieve more complex objectives (e.g., “Optimize your path to 500 gold in your wallet based on your current state”)

## Prompts
Two main prompt files are used by the agent:
- zidle-provider.ts: Contains all the actions that the agent can perform in the game.
- zidle-context.ts / zidle-context-chat.ts: These files provide the game data required for the agent to play zIdle. They are nearly identical, except the chat version includes slight modifications to instruct the agent on how to respond to user inputs.

## How zIdle Works

Each character in zIdle is represented by an NFT with an attached wallet. Only the NFT owner can execute transactions on behalf of the NFT. Here’s how the agent interacts with the game:

1. NFT Verification
- The agent checks its NFT token ID using the token_of_owner_by_index function with a hardcoded index.
- Once the token ID is obtained, it is used as part of the calldata for every game system.

2. Wallet Verification
- The agent retrieves the NFT wallet address using the wallet_of endpoint.
- This wallet address is then used to check the gold amount (gold is an ERC20 token stored in the NFT wallet).

3. Interacting with Game Contracts
- With the NFT token and wallet information, the agent can now interact with the game contracts.

## Hardcoded Values in the Provider Prompt
For simplicity, we have hardcoded some variables in the prompt to avoid unnecessary complexity in the agent’s decision-making process. These values allow the agent to focus on executing actions without requiring additional setup each time it runs.

- CHECK_NFT: 
The second argument is set to 5, representing the index of the NFT used to play the game.
- GET_GOALS_STATUS & VALIDATE_GOAL:
The second argument is set to 2, which represents the arena in which the agent will try to achieve the goals.

