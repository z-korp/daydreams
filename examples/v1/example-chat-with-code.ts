import { z } from "zod";
import { createDreams, LogLevel, action, discord } from "@daydreamsai/core/v1";
import { Octokit } from "@octokit/rest";
import { google } from "@ai-sdk/google";

const agent = createDreams({
  logger: LogLevel.DEBUG,
  model: google("gemini-2.0-flash-001"),
  extensions: [discord],
  actions: [
    action({
      name: "fetchGitHubRepo",
      install({ container }) {
        container.singleton(
          "octokit",
          () =>
            new Octokit({
              auth: process.env.GITHUB_TOKEN,
            })
        );
      },
      description: "Fetch and analyze contents of a GitHub repository",
      schema: z.object({
        owner: z.string().describe("The GitHub repository owner"),
        repo: z.string().describe("The repository name"),
        path: z
          .string()
          .optional()
          .describe("Optional specific path within the repository"),
      }),
      async handler({ data }, ctx, app) {
        const octokit = app.container.resolve<Octokit>("octokit");
        try {
          const response = await octokit.repos.getContent({
            owner: data.owner,
            repo: data.repo,
            path: data.path || "",
          });

          let contents = "";

          if (Array.isArray(response.data)) {
            for (const item of response.data) {
              if (
                item.type === "file" &&
                item.name.match(/\.(ts|js|tsx|jsx|md|json)$/)
              ) {
                const fileContent = await octokit.repos.getContent({
                  owner: data.owner,
                  repo: data.repo,
                  path: item.path,
                });

                if ("content" in fileContent.data) {
                  contents += `\n--- ${item.path} ---\n`;
                  contents += Buffer.from(
                    fileContent.data.content,
                    "base64"
                  ).toString();
                }
              } else if (item.type === "dir") {
                const subContents = await this.handler({
                  owner: data.owner,
                  repo: data.repo,
                  path: item.path,
                });
                contents += subContents.contents;
              }
            }
          } else if ("content" in response.data) {
            contents = Buffer.from(response.data.content, "base64").toString();
          }

          return {
            contents,
            repoInfo: {
              owner: data.owner,
              repo: data.repo,
              path: data.path || "",
            },
          };
        } catch (error) {
          console.error("Error fetching repo contents:", error);
          throw new Error(
            `Failed to fetch repository contents: ${error.message}`
          );
        }
      },
    }),
  ],
});

console.log("Starting GitHub Repo Chat Bot...");
await agent.start();
