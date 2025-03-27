"use client";
import Link from "next/link";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Heart, MousePointer, Terminal } from "lucide-react";
import Image from "next/image";

// Utility function for combining classnames
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// Add a standardized button styling function
const buttonStyles = {
  primary: "bg-purple-600 hover:bg-purple-500 text-white",
  secondary: "bg-white hover:bg-gray-100 text-purple-900",
  outline: "border border-white/20 bg-transparent hover:bg-white/10 text-white",
  ghost: "bg-white/10 hover:bg-white/20 text-white",
};

export default function Home() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npm install @daydreamsai/core");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gridColor =
    "color-mix(in oklab, var(--color-purple-600) 10%, transparent)";

  return (
    <>
      <main className="container relative max-w-[1100px] px-2 py-4 z-[2] lg:py-8 dark text-white">
        <div
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent, rgba(255,255,255,0.03) 500px, transparent 1000px)",
          }}
        >
          {/* Content sections will go here */}
          <Hero />
          {/* <Feedback /> */}
          <Installation />
          <Features />
          {/* <Highlights /> */}
          <TwitterCards />
          <CallToAction />
        </div>
      </main>
    </>
  );
}

// Placeholder components to be filled in later
function Hero() {
  return (
    <div className="relative z-[2] flex flex-col border-x border-t bg-black/20 px-6 pt-12 max-md:text-center md:px-12 md:pt-16 max-lg:overflow-hidden">
      <div className="mx-auto w-full max-w-3xl mb-8">
        <img className="mx-auto" src="/Daydreams.png" alt="Daydreams Logo" />
      </div>

      <h2 className="text-2xl font-medium text-white/90 text-center mb-6">
        A generative crosschain agent framework
      </h2>

      <p className="mb-8 text-white/80 md:max-w-[80%] mx-auto text-center md:text-xl">
        Build and deploy AI agents that can execute anything onchain with
        Daydreams.
      </p>

      <div className="flex items-center justify-center gap-3 mb-12">
        <Link
          href="/docs"
          className={cn(
            buttonStyles.secondary,
            "px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors rounded-md"
          )}
        >
          Get Started
        </Link>
        <Link
          href="/docs"
          className={cn(
            buttonStyles.outline,
            "px-4 py-2.5 text-sm font-semibold transition-colors rounded-md"
          )}
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

function Feedback() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden border-x border-t px-6 py-8 md:py-16">
      <div
        className="absolute inset-x-0 bottom-0 z-[-1] h-24 opacity-30 duration-1000 animate-in fade-in"
        style={{
          maskImage: "linear-gradient(to bottom,transparent,white)",
          backgroundImage:
            "linear-gradient(to right, #4ebfff, transparent, #e92a67)",
        }}
      />
      <p className="text-center font-medium text-white/60">
        Trusted by builders and developers worldwide
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-8">
        <div className="flex items-center justify-center h-12 w-24 opacity-70 hover:opacity-100 transition-opacity">
          <div className="text-xl font-bold text-white">Company 1</div>
        </div>
        <div className="flex items-center justify-center h-12 w-24 opacity-70 hover:opacity-100 transition-opacity">
          <div className="text-xl font-bold text-white">Company 2</div>
        </div>
        <div className="flex items-center justify-center h-12 w-24 opacity-70 hover:opacity-100 transition-opacity">
          <div className="text-xl font-bold text-white">Company 3</div>
        </div>
        <div className="flex items-center justify-center h-12 w-24 opacity-70 hover:opacity-100 transition-opacity">
          <div className="text-xl font-bold text-white">Company 4</div>
        </div>
      </div>

      <Link
        href="/showcase"
        className={cn(
          buttonStyles.ghost,
          "mt-6 px-4 py-2 text-sm font-medium rounded-md transition-colors"
        )}
      >
        View Showcase
      </Link>
    </div>
  );
}

function Installation() {
  const [copied, setCopied] = useState(false);
  const [configCopied, setConfigCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("npm install @daydreamsai/core");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfigCopy = async () => {
    await navigator.clipboard
      .writeText(`import { Agent } from "@daydreamsai/core";

const agent = new Agent({
  apiKey: "your-api-key",
  chain: "ethereum", // or "solana", "polygon", etc.
  options: {
    model: "gpt-4",
    autoExecute: true,
  }
});`);
    setConfigCopied(true);
    setTimeout(() => setConfigCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col gap-2 border-l border-t px-6 py-12 md:py-16">
        <div className="inline-flex size-7 items-center justify-center rounded-full bg-purple-600 font-medium text-white">
          1
        </div>
        <h3 className="text-xl font-semibold">Install</h3>
        <p className="mb-8 text-white/80">Install Daydreams with npm or yarn</p>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
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

      <div className="flex flex-col gap-2 border-l border-t px-6 py-12 md:py-16">
        <div className="inline-flex size-7 items-center justify-center rounded-full bg-purple-600 font-medium text-white">
          2
        </div>
        <h3 className="text-xl font-semibold">Configure</h3>
        <p className="mb-8 text-white/80">
          Set up your Daydreams configuration
        </p>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <button
              onClick={handleConfigCopy}
              className="text-xs text-white/60 hover:text-white/90 transition-colors flex items-center gap-1.5"
            >
              {configCopied ? (
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
          <div className="bg-black/30 rounded-lg p-4 overflow-auto">
            <pre className="text-sm text-white/90 font-mono">
              <code>{`import { Agent } from "@daydreamsai/core";

const agent = createDreams({
  model: groq("deepseek-r1-distill-llama-70b"),
  extensions: [cli],
}).start();`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  return (
    <div className="grid grid-cols-1 border-x border-t md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full flex flex-row items-start justify-center border-l border-t p-8 pb-2 text-center">
        <h2 className="bg-purple-600 text-white px-2 text-2xl font-semibold">
          Features
        </h2>
      </div>

      {/* Feature Card 1 */}
      <Link
        href="/docs/introduction"
        className="group bg-white/5 backdrop-blur-sm p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
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
        <div
          className={cn(
            buttonStyles.ghost,
            "mt-4 inline-flex items-center px-3 py-1 text-sm rounded-md"
          )}
        >
          <span>Get started</span>
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
      </Link>

      {/* Feature Card 2 */}
      <Link
        href="/docs/agents/overview"
        className="group bg-white/5 backdrop-blur-sm p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
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
          <h3 className="text-lg font-medium text-white">Agents</h3>
        </div>
        <p className="text-sm text-white/80">Build agents with Daydreams</p>
        <div
          className={cn(
            buttonStyles.ghost,
            "mt-4 inline-flex items-center px-3 py-1 text-sm rounded-md"
          )}
        >
          <span>View guides</span>
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
      </Link>

      {/* Feature Card 3 */}
      <Link
        href="/docs/guides/twitter"
        className="group bg-white/5 backdrop-blur-sm p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
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
          <h3 className="text-lg font-medium text-white">Guide</h3>
        </div>
        <p className="text-sm text-white/80">Types and interfaces</p>
        <div
          className={cn(
            buttonStyles.ghost,
            "mt-4 inline-flex items-center px-3 py-1 text-sm rounded-md"
          )}
        >
          <span>Explore Guide</span>
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
      </Link>
    </div>
  );
}

function Highlights() {
  return (
    <div className="grid grid-cols-1 border-r md:grid-cols-2 lg:grid-cols-3">
      <div className="col-span-full flex flex-row items-start justify-center border-l border-t p-8 pb-2 text-center">
        <h2 className="bg-purple-600 text-white px-2 text-2xl font-semibold">
          Highlights
        </h2>
      </div>

      <Highlight icon={Terminal} heading="Cross-chain Execution">
        Execute transactions on any supported blockchain with a unified API.
      </Highlight>

      <Highlight icon={Terminal} heading="Natural Language">
        Describe actions in natural language and have them executed onchain.
      </Highlight>

      <Highlight icon={Terminal} heading="AI-Powered">
        Leverage AI to make complex onchain decisions and take actions.
      </Highlight>

      <Highlight icon={Terminal} heading="Automations">
        Create automated sequences that respond to onchain events.
      </Highlight>

      <Highlight icon={Terminal} heading="Wallet Management">
        Secure wallet management for agent-based transactions.
      </Highlight>

      <Highlight icon={Terminal} heading="Developer Tools">
        Rich tools for building, testing, and deploying agents.
      </Highlight>
    </div>
  );
}

function TwitterCards() {
  return (
    <div className="border-x border-t py-16 px-8">
      <h2 className="text-center text-2xl font-semibold mb-8 text-white">
        <span className="bg-purple-600 text-white px-2 py-1">
          Join Our Community
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm p-6 border border-white/10 rounded-lg hover:border-purple-500/50 transition-colors">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Twitter</h3>
              <p className="text-sm text-white/60">@daydreamsagents</p>
            </div>
          </div>
          <p className="text-white/80 mb-4">
            Follow us on Twitter for the latest updates, tutorials, and
            announcements.
          </p>
          <a
            href="https://twitter.com/daydreamsagents"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles.ghost,
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
            )}
          >
            Follow us
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 border border-white/10 rounded-lg hover:border-purple-500/50 transition-colors">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-white">Telegram</h3>
              <p className="text-sm text-white/60">Daydreams Community</p>
            </div>
          </div>
          <p className="text-white/80 mb-4">
            Join our Telegram group to connect with other developers and get
            help.
          </p>
          <a
            href="https://t.me/+lJiqFdtbk-kzNmE0"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonStyles.ghost,
              "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md"
            )}
          >
            Join channel
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function Highlight({
  icon: Icon,
  heading,
  children,
}: {
  icon: any;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l border-t px-6 py-12">
      <div className="mb-4 flex flex-row items-center gap-2 text-white/60">
        <Icon className="size-4" />
        <h2 className="text-sm font-medium">{heading}</h2>
      </div>
      <span className="text-white/80">{children}</span>
    </div>
  );
}

function CallToAction() {
  return (
    <div className="py-16 text-center border-x border-t border-b">
      <h2 className="text-3xl font-medium text-white mb-6 tracking-tight">
        Start dreaming...
      </h2>

      <div className="flex justify-center gap-6">
        <a
          href="https://discord.gg/rt8ajxQvXh"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonStyles.primary,
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors rounded-md"
          )}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          Join Discord
        </a>
        <a
          href="/docs"
          className={cn(
            buttonStyles.secondary,
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors rounded-md"
          )}
        >
          Start Building
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
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
