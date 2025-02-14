import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import type { Metadata } from "next";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata: Metadata = {
  description: "Make beautiful websites with Next.js & MDX.",
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
    logo={<img src="/Daydreams.png" alt="Daydreams Logo" width="150" />}
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Daydreams.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head>
        <link rel="icon" href="/Daydreams.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Daydreams.png" />
        <link rel="manifest" href="/site.webmanifest" />
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
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
