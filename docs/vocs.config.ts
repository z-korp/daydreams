import { defineConfig } from "vocs";

export default defineConfig({
 title: "Daydreams Documentation",
 description: "Daydreams | generative agents",
 iconUrl: "/favicon-32x32.png",
 logoUrl: "/banner.png",
 font: {
   google: "Open Sans",
 },
 theme: {
   colorScheme: "dark",
   variables: {
     color: {
       textAccent: "#ee2d3f",
       background: "#0c0c0c",
       backgroundDark: "#121212",
       noteBackground: "#1a1a1a",
     },
   },
 },
 sidebar: [
  { 
    text: "Overview",
    link: "/",
    items: [
      {
        text: "API",
        items: [
          { text: "Globals", link: "/api-reference/globals" },
          {
            text: "Namespaces",
            items: [
              { text: "Chains", link: "/api-reference/namespaces/Chains" },
              { 
                text: "IO", 
                items: [
                  { text: "Twitter", link: "/api-reference/namespaces/IO/namespaces/Twitter" }
                ]
              },
              { text: "Processors", link: "/api-reference/namespaces/Processors" },
              { text: "Providers", link: "/api-reference/namespaces/Providers" },
              { text: "Types", link: "/api-reference/namespaces/Types" },
              { text: "Utils", link: "/api-reference/namespaces/Utils" }
            ]
          }
        ]
      }
    ]
  }
]
});