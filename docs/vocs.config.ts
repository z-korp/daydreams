import { defineConfig } from "vocs";

export default defineConfig({
  banner: "Head to our new [Discord](https://discord.gg/rt8ajxQvXh)!",
  title: "Daydreams Documentation",
  description: "Daydreams | generative agents",
  iconUrl: "/favicon-32x32.png",
  logoUrl: "/Daydreams.png",
  topNav: [
    { text: "Site", link: "https://dreams.fun" },
    {
      text: "Releases",
      link: "https://github.com/daydreamsai/daydreams/releases",
    },
  ],
  socials: [
    {
      icon: "github",
      link: "https://github.com/daydreamsai/daydreams",
    },
    {
      icon: "x",
      link: "https://x.com/daydreamsagents",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/daydreamsai/daydreams/tree/main/docs/pages/:path",
    text: "Edit on GitHub",
  },
  font: {
    google: "Inconsolata",
  },
  theme: {
    colorScheme: "dark",
    variables: {
      color: {
        textAccent: "#bda5ff",
        background: "#1c1c1c",
        backgroundDark: "#1c1c1c",
        noteBackground: "#1a1a1a",
      },
    },
  },
  sidebar: [
    {
      text: "Introduction",
      link: "/",
    },
    {
      text: "Getting Started",
      items: [
        {
          text: "Installation",
          link: "/getting-started/installation",
        },
      ],
    },
    // {
    //   text: "Agents",
    //   items: [
    //     { text: "Overview", link: "/agents/overview" },
    //     { text: "Creation", link: "/agents/creation" },
    //     { text: "Context", link: "/agents/context" },
    //     { text: "Actions", link: "/agents/actions" },
    //   ],
    // },
    {
      text: "Guides",
      items: [
        { text: "Deep Research", link: "/guides/deep-research" },
        { text: "Twitter", link: "/guides/twitter" },
      ],
    },
    {
      text: "Types",
      items: [
        {
          text: "API",
          items: [{ text: "Globals", link: "/api-reference/globals" }],
        },
      ],
    },
  ],
});
