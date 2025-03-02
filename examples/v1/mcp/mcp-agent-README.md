# MCP Agent Example

This example demonstrates how to create a Daydreams agent that connects to an
MCP server and uses its resources through the MCP extension.

## Overview

The example shows:

1. How to set up the MCP extension with a server configuration
2. How to connect to an MCP server using stdio transport
3. How to create a custom action that uses MCP server capabilities
4. How to interact with MCP server resources and tools

## How It Works

The example:

1. Connects to an MCP server (mcp-server-example.mjs) using stdio transport
2. Creates an agent with the MCP extension configured to connect to this server
3. Defines a custom action that interacts with the server's capabilities
4. Executes the custom action to demonstrate MCP functionality

The MCP server provides access to resources including a dynamic greeting
resource and tools like an addition calculator that can be accessed through the
MCP extension.

## Server Implementation

The MCP server example (`mcp-server-example.mjs`) is implemented as an ES module
and includes:

1. A simple addition tool that adds two numbers
2. A dynamic greeting resource that generates personalized greetings

The server is started using:

```javascript
// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});

// Add resources and tools...

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Running the Example

To run this example:

```bash
# Run the example server
npx @modelcontextprotocol/inspector node examples/v1/mcp-server-example.mjs

# run the agent
bun run examples/v1/mcp/mcp-agent.ts
```

## Code Structure

- `mcp-agent.ts` - The main example file that sets up the agent and demonstrates
  its usage
- `mcp-server-example.mjs` - A simple MCP server that provides access to
  resources and tools

## Key Components

### MCP Server

The MCP server example exposes:

- A tool called `add` that adds two numbers
- A dynamic resource template `greeting://{name}` that generates personalized
  greetings

### MCP Extension

The MCP extension is configured to connect to the example server:

```typescript
createMcpExtension([
  {
    id: "example-server",
    name: "Example Resource Server",
    transport: {
      type: "stdio",
      command: "node",
      args: [path.join(__dirname, "mcp-server-example.mjs")],
    },
    capabilities: {
      resources: {},
    },
  },
]);
```

### Custom Action

The example defines a custom action that demonstrates how to:

1. Call the server's `add` tool to perform calculations
2. Access the dynamic greeting resource using the resource URI pattern

Note: The server does not support all MCP methods (like `listPrompts`), so the
agent should only use the methods that are explicitly implemented in the server.

## Related Resources

- See the
  [MCP Integration README](../../../packages/core/src/extensions/mcp/README.md)
  for more details on the MCP extension
- See the
  [MCP TypeScript SDK documentation](https://github.com/model-context-protocol/typescript-sdk)
  for more information on the Model Context Protocol
