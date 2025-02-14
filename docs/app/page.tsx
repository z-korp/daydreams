"use client";
import { useState } from "react";
import { Inter } from "next/font/google";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl, light } from "react-syntax-highlighter";

const inter = Inter({ subsets: ["latin"] });

const exampleCode1 = `import { createGroq } from "@ai-sdk/groq";
import { createDreams, cli } from "@daydreamsai/core/v1";

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
  twitter,
} from "@daydreamsai/core/v1";

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
import { createDreams, cli } from "@daydreamsai/core/v1";

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
  twitter,
} from "@daydreamsai/core/v1";

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
      <div
        className="absolute inset-0 -z-10 animate-gradient bg-[length:200%_200%]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(17,24,39,1), rgba(88,28,135,0.8), rgba(15,23,42,1))",
        }}
      />

      {/* Content wrapper with subtle backdrop blur */}
      <div className="relative">
        {/* Hero Section */}
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mx-auto">
              <img
                className="mx-auto"
                src="/Daydreams.png"
                alt="Daydreams Logo"
              />
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80 font-light">
              Daydreams is a powerful framework for building generative agents
              that can execute tasks across any blockchain or API.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/introduction/"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100 transition-colors"
              >
                Get started
              </a>
              <a
                href="/getting-started/"
                className="text-sm font-medium leading-6 text-white hover:text-white/80 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* NPM Installation Section */}
        <div className="mx-auto max-w-3xl px-6 pb-24">
          <div className="rounded-lg bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/30 rounded-lg p-6">
              <code className="text-base text-white/90 font-mono tracking-tight">
                npm install @daydreamsai/core
              </code>
            </div>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Installation Card */}
            <a
              href="/introduction/"
              className="group rounded-lg bg-white/5 p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Installation</h3>
              </div>
              <p className="text-sm text-white/80">
                Learn the basics and get up and running in minutes
              </p>
              <div className="mt-4 flex items-center text-purple-300 group-hover:text-purple-200">
                <span className="text-sm">Get started</span>
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </a>

            {/* Guides Card */}
            <a
              href="/guides/deep-research/"
              className="group rounded-lg bg-white/5 p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">Guides</h3>
              </div>
              <p className="text-sm text-white/80">
                Explore our library of pre-built components
              </p>
              <div className="mt-4 flex items-center text-purple-300 group-hover:text-purple-200">
                <span className="text-sm">View guides</span>
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </a>

            {/* API Reference Card */}
            <a
              href="/api-reference/"
              className="group rounded-lg bg-white/5 p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white">
                  API Reference
                </h3>
              </div>
              <p className="text-sm text-white/80">
                Follow our detailed tutorials and examples
              </p>
              <div className="mt-4 flex items-center text-purple-300 group-hover:text-purple-200">
                <span className="text-sm">Explore API</span>
                <svg
                  className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Example Agents Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <h2 className="text-3xl font-medium text-white mb-8 text-center tracking-tight">
            Example Agent Designs
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Barebones Agent Example */}
            <div className="rounded-lg bg-white/5 p-6 border border-white/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    Barebones Agent
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={GITHUB_EXAMPLE_1_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                      />
                    </svg>
                    <span>View on GitHub</span>
                  </a>
                  <button
                    onClick={handleCopyExample1}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
                  >
                    {copiedExample1 ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded bg-black/40 backdrop-blur-sm">
                <SyntaxHighlighter
                  language="typescript"
                  style={nightOwl}
                  customStyle={{
                    background: "rgba(255, 255, 255, 1)",
                    padding: "1rem",
                    margin: 0,
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: "400",
                    WebkitFontSmoothing: "auto",
                    MozOsxFontSmoothing: "auto",
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                  lineNumberStyle={{
                    minWidth: "2.5em",
                    paddingRight: "1em",
                    color: "rgba(255, 255, 255, 0.2)",
                    textAlign: "right",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: "400",
                  }}
                >
                  {exampleCode1}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* X Agent Example */}
            <div className="rounded-lg bg-white/5 p-6 border border-white/10 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white">X Agent</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={GITHUB_EXAMPLE_2_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                      />
                    </svg>
                    <span>View on GitHub</span>
                  </a>
                  <button
                    onClick={handleCopyExample2}
                    className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
                  >
                    {copiedExample2 ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded bg-black/40 backdrop-blur-sm">
                <SyntaxHighlighter
                  language="typescript"
                  style={light}
                  customStyle={{
                    background: "rgba(255, 255, 255, 1)",
                    padding: "1rem",
                    margin: 0,
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: "400",
                    WebkitFontSmoothing: "auto",
                    MozOsxFontSmoothing: "auto",
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                  lineNumberStyle={{
                    minWidth: "2.5em",
                    paddingRight: "1em",
                    color: "rgba(255, 255, 255, 0.2)",
                    textAlign: "right",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontWeight: "400",
                  }}
                >
                  {exampleCode2}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
