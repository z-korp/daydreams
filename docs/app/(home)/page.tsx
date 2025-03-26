"use client";

import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const exampleCode1 = `import { createGroq } from "@ai-sdk/groq";
import { createDreams } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [cli],
}).start();`;

const exampleCode2 = `import { createGroq } from "@ai-sdk/groq";
import {
  createContainer,
  createDreams,
  LogLevel,
} from "@daydreamsai/core";
import { twitter } from "@daydreamsai/core/extensions";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createDreams({
  logger: LogLevel.DEBUG,
  container: createContainer(),
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [twitter],
});

// Start the agent
await agent.start();`;

// Add these constants at the top with the example codes
const GITHUB_EXAMPLE_1_URL =
  "https://github.com/daydreamsai/daydreams/blob/main/examples/v1/example-basic.ts";
const GITHUB_EXAMPLE_2_URL =
  "https://github.com/daydreamsai/daydreams/blob/main/examples/v1/example-twitter.ts";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [copiedExample1, setCopiedExample1] = useState(false);
  const [copiedExample2, setCopiedExample2] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npm install @daydreamsai/core");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyExample1 = async () => {
    await navigator.clipboard
      .writeText(`import { createGroq } from "@ai-sdk/groq";
import { createDreams } from "@daydreamsai/core";
import { cli } from "@daydreamsai/core/extensions";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [cli],
}).start();`);
    setCopiedExample1(true);
    setTimeout(() => setCopiedExample1(false), 2000);
  };

  const handleCopyExample2 = async () => {
    await navigator.clipboard
      .writeText(`import { createGroq } from "@ai-sdk/groq";
import {
  createContainer,
  createDreams,
  LogLevel,
} from "@daydreamsai/core";
import { twitter } from "@daydreamsai/core/extensions";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const agent = createDreams({
  logger: LogLevel.DEBUG,
  container: createContainer(),
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [twitter],
});

// Start the agent
await agent.start();`);
    setCopiedExample2(true);
    setTimeout(() => setCopiedExample2(false), 2000);
  };

  return (
    <div className={`min-h-screen relative ${inter.className}`}>
      {/* Animated Gradient Background */}
    </div>
  );
}
