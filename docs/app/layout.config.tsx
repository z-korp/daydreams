import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <img
          src="/Daydreams.png"
          alt="Daydreams Logo"
          width="150"
          height="24"
        />
      </>
    ),
  },
  // links: [
  //   {
  //     text: "Documentation",
  //     url: "/docs",
  //     active: "nested-url",
  //   },
  // ],
};
