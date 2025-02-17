import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { Metadata } from "next";
import "nextra-theme-docs/style.css";
import "./globals.css";
import { Inter, Open_Sans } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  description:
    "Daydreams is a powerful framework for building generative agents that can execute tasks across any blockchain or API.",
  metadataBase: new URL("https://dreams.fun"),
  keywords: ["Daydreams", "agents"],
  generator: "Next.js",
  applicationName: "Daydreams",
  appleWebApp: {
    title: "Daydreams",
  },
  title: {
    default: "Daydreams | Generative Agents",
    template: "%s | Daydreams",
  },
  openGraph: {
    url: "./",
    siteName: "Daydreams",
    locale: "en_US",
    type: "website",
  },
  other: {
    "msapplication-TileColor": "#fff",
  },
  twitter: {
    site: "https://dreams.fun",
  },
  alternates: {
    canonical: "./",
  },
};

const banner = (
  <Banner storageKey="some-key">Daydreams 0.1.0 is released 🎉</Banner>
);
const navbar = (
  <Navbar
    className="bg-transparent"
    logo={<img src="/Daydreams.png" alt="Daydreams Logo" width="150" />}
  />
);
const footer = (
  <div className="flex items-center justify-between px-6 py-4">
    <div className="text-sm">MIT {new Date().getFullYear()} © Daydreams.</div>

    <div className="text-sm text-gray-500 italic hidden sm:block">
      "All those moments will be lost in time, like tears in rain."
    </div>

    <div className="flex items-center gap-4">
      <a
        href="https://twitter.com/daydreamsagents"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href="https://github.com/daydreamsai/daydreams"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
          />
        </svg>
      </a>
      <a
        href="https://discord.gg/rt8ajxQvXh"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </a>
    </div>
  </div>
);

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      className={openSans.className}
    >
      <Head
        color={{
          hue: 270, // Purple hue
          saturation: 100,
          lightness: {
            light: 50,
            dark: 50,
          },
        }}
      >
        <link rel="icon" href="/Daydreams.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Daydreams.png" />
        {/* favicon */}
        <link rel="icon" href="/favicon-32x32.png" sizes="any" />
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/daydreamsai/daydreams/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
