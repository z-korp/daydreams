import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

const jetbrainsMono = Open_Sans({
  subsets: ["latin"],
  variable: "--font-mono",
});

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

export default function Layout({ children }: { children: any }) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
