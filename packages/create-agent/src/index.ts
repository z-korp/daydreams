import path from "path";
import fs from "fs-extra";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { execa } from "execa";
import prompts from "prompts";

// Define the CLI program
const program = new Command()
    .name("create-agent")
    .description("Bootstrap a new Daydreams agent")
    .version("0.1.0")
    .argument("[directory]", "Directory to create the agent in")
    .option("--twitter", "Include Twitter extension")
    .option("--discord", "Include Discord extension")
    .option("--cli", "Include CLI extension")
    .option("--telegram", "Include Telegram extension")
    .option("--all", "Include all extensions")
    .parse(process.argv);

async function main() {
    const options = program.opts();
    const targetDir = program.args[0] || ".";
    const cwd = process.cwd();
    const targetPath = path.resolve(cwd, targetDir);

    // Check if target directory exists and is not empty
    if (fs.existsSync(targetPath)) {
        const files = await fs.readdir(targetPath);
        if (files.length > 0) {
            const { proceed } = await prompts({
                type: "confirm",
                name: "proceed",
                message: `Directory ${chalk.cyan(targetPath)} is not empty. Continue?`,
                initial: false,
            });

            if (!proceed) {
                console.log(chalk.red("Aborted."));
                return;
            }
        }
    } else {
        await fs.mkdir(targetPath, { recursive: true });
    }

    console.log();
    console.log(chalk.bold("Creating a new Daydreams agent..."));
    console.log();

    // Determine selected extensions
    const selectedExtensions = [];
    if (options.all) {
        selectedExtensions.push("cli", "twitter", "discord", "telegram");
    } else {
        if (options.cli) selectedExtensions.push("cli");
        if (options.twitter) selectedExtensions.push("twitter");
        if (options.discord) selectedExtensions.push("discord");
        if (options.telegram) selectedExtensions.push("telegram");
    }

    // If no extensions were selected via flags, prompt the user
    if (selectedExtensions.length === 0) {
        const { extensions } = await prompts({
            type: "multiselect",
            name: "extensions",
            message: "Select extensions to include",
            choices: [
                { title: "CLI", value: "cli" },
                { title: "Twitter", value: "twitter" },
                { title: "Discord", value: "discord" },
                { title: "Telegram", value: "telegram" },
            ],
        });

        if (!extensions || extensions.length === 0) {
            console.log(
                chalk.yellow(
                    "No extensions selected. Including CLI extension by default."
                )
            );
            selectedExtensions.push("cli");
        } else {
            selectedExtensions.push(...extensions);
        }
    }

    // Create package.json
    const spinner = ora("Creating package.json").start();
    const packageJson: {
        name: string;
        version: string;
        type: string;
        scripts: Record<string, string>;
        dependencies: Record<string, string>;
    } = {
        name: path.basename(targetPath),
        version: "0.1.0",
        type: "module",
        scripts: {
            start: "bun run index.js",
            dev: "bun run index.js",
        },
        dependencies: {
            "@daydreamsai/core": "^0.2.6",
            "@ai-sdk/anthropic": "^1.1.6",
            "@ai-sdk/google": "^1.1.16",
            "@ai-sdk/groq": "^1.1.7",
            "@ai-sdk/openai": "^1.1.14",
            "@jitsi/robotjs": "^0.6.13",
            "@mendable/firecrawl-js": "^1.16.0",
            "@openrouter/ai-sdk-provider": "^0.2.1",
            "@tailwindcss/postcss": "^4.0.6",
            "@tavily/core": "^0.3.1",
            ai: "^4.1.25",
            ajv: "^8.17.1",
            chalk: "^5.4.1",
            chromadb: "^1.5.5",
            cors: "^2.8.5",
            "discord.js": "^14.17.3",
            express: "^4.21.2",
            hyperliquid: "^1.5.8",
            lerna: "^8.1.9",
            mongodb: "^6.13.0",
            prettier: "^3.4.2",
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            readline: "^1.3.0",
            robotjs: "^0.6.0",
            "screenshot-desktop": "^1.15.1",
            sharp: "^0.33.5",
            tailwindcss: "^4.0.6",
            telegraf: "^4.16.3",
            telegram: "^2.26.16",
            ws: "^8.18.0",
            zod: "^3.24.1",
            "zod-to-json-schema": "^3.24.1",
        },
    };

    // Add extension-specific dependencies
    if (selectedExtensions.includes("discord")) {
        packageJson.dependencies["discord.js"] = "^14.14.1";
    }

    await fs.writeFile(
        path.join(targetPath, "package.json"),
        JSON.stringify(packageJson, null, 2)
    );
    spinner.succeed("Created package.json");

    // Create index.ts with selected extensions
    spinner.start("Creating agent with selected extensions");
    const imports = [`import { createDreams } from "@daydreamsai/core";`];
    const extensions = [];

    for (const ext of selectedExtensions) {
        if (ext === "cli") {
            imports.push(`import { cli } from "@daydreamsai/core/extensions";`);
            extensions.push("cli");
        } else if (ext === "twitter") {
            imports.push(
                `import { twitter } from "@daydreamsai/core/extensions";`
            );
            extensions.push("twitter");
        } else if (ext === "discord") {
            imports.push(
                `import { discord } from "@daydreamsai/core/extensions";`
            );
            extensions.push("discord");
        } else if (ext === "telegram") {
            imports.push(
                `import { telegram } from "@daydreamsai/core/extensions";`
            );
            extensions.push("telegram");
        }
    }

    // Create agent code
    const agentCode = `${imports.join("\n")}

const agent = createDreams({
  extensions: [${extensions.join(", ")}],
});

// Start the agent
agent.start();
`;

    await fs.writeFile(path.join(targetPath, "index.ts"), agentCode);
    spinner.succeed(
        `Created agent with extensions: ${selectedExtensions.join(", ")}`
    );

    // Create .env file with required environment variables
    spinner.start("Creating .env file");
    const envVariables = ["# Daydreams Environment Variables\n"];

    if (selectedExtensions.includes("discord")) {
        envVariables.push("# Discord Configuration");
        envVariables.push("DISCORD_TOKEN=your_discord_token");
        envVariables.push("DISCORD_BOT_NAME=your_bot_name\n");
    }

    if (selectedExtensions.includes("twitter")) {
        envVariables.push("# Twitter Configuration");
        envVariables.push("TWITTER_CONSUMER_KEY=your_consumer_key");
        envVariables.push("TWITTER_CONSUMER_SECRET=your_consumer_secret");
        envVariables.push("TWITTER_ACCESS_TOKEN=your_access_token");
        envVariables.push(
            "TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret\n"
        );
    }

    if (selectedExtensions.includes("telegram")) {
        envVariables.push("# Telegram Configuration");
        envVariables.push("TELEGRAM_BOT_TOKEN=your_telegram_token\n");
    }

    await fs.writeFile(
        path.join(targetPath, ".env.example"),
        envVariables.join("\n")
    );
    spinner.succeed("Created .env.example file");

    // Create README
    spinner.start("Creating README");
    const readmeContent = `# ${path.basename(targetPath)}

A Daydreams agent with the following extensions:
${selectedExtensions.map((ext) => `- ${ext}`).join("\n")}

## Getting Started

1. Copy \`.env.example\` to \`.env\` and fill in the required values.
2. Install dependencies:

\`\`\`
npm install
\`\`\`

3. Run the agent:

\`\`\`
npm start
\`\`\`
`;

    await fs.writeFile(path.join(targetPath, "README.md"), readmeContent);
    spinner.succeed("Created README");

    // Install dependencies
    spinner.start("Installing dependencies");
    try {
        const packageManager = await detectPackageManager();
        console.log(chalk.blue(`Using package manager: ${packageManager}`));

        console.log(
            chalk.blue(`Running: ${packageManager} install in ${targetPath}`)
        );
        const { stdout, stderr } = await execa(packageManager, ["install"], {
            cwd: targetPath,
            stdio: "pipe", // Capture output
        });

        console.log(chalk.gray("Installation output:"));
        console.log(chalk.gray(stdout));

        if (stderr) {
            console.log(chalk.yellow("Installation warnings:"));
            console.log(chalk.yellow(stderr));
        }

        // Verify node_modules exists
        const nodeModulesPath = path.join(targetPath, "node_modules");
        const nodeModulesExists = await fs.pathExists(nodeModulesPath);

        if (nodeModulesExists) {
            spinner.succeed(`Installed dependencies using ${packageManager}`);
            console.log(
                chalk.green(
                    `Node modules directory created at: ${nodeModulesPath}`
                )
            );
        } else {
            spinner.warn(
                `Dependencies seemed to install but node_modules directory wasn't found`
            );
            console.log(chalk.yellow(`Will try with pnpm specifically...`));

            // Try with pnpm specifically if node_modules wasn't created
            console.log(chalk.blue(`Running: pnpm install in ${targetPath}`));
            await execa("pnpm", ["install"], { cwd: targetPath });

            // Check again
            const nodeModulesExistsNow = await fs.pathExists(nodeModulesPath);
            if (nodeModulesExistsNow) {
                spinner.succeed(`Installed dependencies using pnpm`);
            } else {
                spinner.fail(`Could not create node_modules directory`);
            }
        }
    } catch (error: unknown) {
        spinner.fail("Failed to install dependencies");
        console.error(
            chalk.red(
                `Error: ${error instanceof Error ? error.message : String(error)}`
            )
        );

        // Try with pnpm as fallback
        try {
            console.log(chalk.yellow("Trying with pnpm as fallback..."));
            await execa("pnpm", ["install"], { cwd: targetPath });
            spinner.succeed("Installed dependencies using pnpm");
        } catch (fallbackError: unknown) {
            console.error(
                chalk.red(
                    `Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
                )
            );
            console.log(
                chalk.yellow(
                    "You can install dependencies manually by running 'pnpm install' in the project directory."
                )
            );
        }
    }

    console.log();
    console.log(
        chalk.green("✅ Your Daydreams agent has been created successfully!")
    );
    console.log();
    console.log(`To get started, run the following commands:`);

    if (targetDir !== ".") {
        console.log(`  cd ${targetDir}`);
    }

    console.log(`  cp .env.example .env`);
    console.log(`  # Fill in the required environment variables in .env`);
    console.log(`  npm start`);
    console.log();
}

async function detectPackageManager() {
    try {
        // Check if pnpm is available first
        try {
            await execa("pnpm", ["--version"]);
            return "pnpm"; // Prefer pnpm if it's available
        } catch {
            // pnpm not available, continue with other checks
        }

        const userAgent = process.env.npm_config_user_agent;
        if (userAgent) {
            if (userAgent.includes("pnpm")) return "pnpm"; // Check pnpm first
            if (userAgent.includes("yarn")) return "yarn";
            if (userAgent.includes("bun")) return "bun";
        }
        return "npm";
    } catch (error) {
        return "npm";
    }
}

main().catch((error) => {
    console.error(
        chalk.red(
            `Error: ${error instanceof Error ? error.message : String(error)}`
        )
    );
    process.exit(1);
});
