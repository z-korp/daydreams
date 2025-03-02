import { createDreams } from "@daydreamsai/core";
import { createMcpExtension } from "@daydreamsai/core/extensions";
import { z } from "zod";
import { LogLevel, type ActionCall } from "@daydreamsai/core";
import path from "path";
import { anthropic } from "@ai-sdk/anthropic";
import { cli } from "@daydreamsai/core/extensions";

/**
 * This example demonstrates how to create an agent that connects to an MCP server
 * and uses its resources through the MCP extension.
 *
 * It sets up a connection to a local MCP server that provides access to resources
 * like application logs.
 */

// Create an agent with the MCP extension
createDreams({
  model: anthropic("claude-3-7-sonnet-latest"),
  logger: LogLevel.DEBUG,

  // Add the MCP extension with the example server configuration
  extensions: [
    cli,
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
    ]),
  ],

  // Define a custom action that uses the MCP server's resources
  actions: [
    {
      name: "read-application-logs",
      description: "Read application logs from the MCP server",
      schema: z.object({}),
      async handler(call, ctx, agent) {
        console.log("Reading application logs from MCP server...");

        try {
          // First, list available resources
          const listResourcesAction = agent.actions.find(
            (a) => a.name === "mcp.listResources"
          );
          if (listResourcesAction) {
            const actionCall: ActionCall<{ serverId: string }> = {
              id: "list-resources-call",
              name: "mcp.listResources",
              content: JSON.stringify({ serverId: "example-server" }),
              data: { serverId: "example-server" },
              ref: "action_call",
              timestamp: Date.now(),
            };

            const resourcesResult = await listResourcesAction.handler(
              actionCall,
              ctx,
              agent
            );
            console.log("Available resources:", resourcesResult?.resources);

            // Then, read the application log resource
            const readResourceAction = agent.actions.find(
              (a) => a.name === "mcp.readResource"
            );
            if (readResourceAction) {
              const actionCall: ActionCall<{
                serverId: string;
                uri: string;
              }> = {
                id: "read-resource-call",
                name: "mcp.readResource",
                content: JSON.stringify({
                  serverId: "example-server",
                  uri: "file:///logs/app.log",
                }),
                data: {
                  serverId: "example-server",
                  uri: "file:///logs/app.log",
                },
                ref: "action_call",
                timestamp: Date.now(),
              };

              const resourceResult = await readResourceAction.handler(
                actionCall,
                ctx,
                agent
              );

              if (resourceResult?.error) {
                return { error: resourceResult.error };
              }

              return {
                message: "Successfully read application logs",
                logs: resourceResult?.resource,
              };
            }
          }

          return { error: "Required MCP actions not found" };
        } catch (error) {
          console.error("Error reading application logs:", error);
          return { error: String(error) };
        }
      },
    },
  ],
}).start({ id: "test", initialGoal: "", initialTasks: [] });
