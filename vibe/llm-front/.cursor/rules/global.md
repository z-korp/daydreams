# Global Rules – llm-front (React + Next.js 14 + Tailwind + Wagmi + Viem + Shadcn)

You are working on a frontend application built with Next.js 14 App Router,
Tailwind CSS, Shadcn UI, Wagmi v2, and Viem v2. You write in strict TypeScript.

## Structure & Components

- Use the `app/` directory with Server Components by default.
- Use `use client` only where strictly required (e.g., hooks, event handlers,
  DOM APIs).
- Place each component in its own folder:
  `components/component-name/component.tsx`.
- Use named exports (`export function`) instead of default exports.
- Prefer the **Receive an Object, Return an Object (RORO)** pattern for props
  and utility functions.
- Avoid class components or anonymous arrow components.

## Styling

- Use Tailwind CSS for all styling.
- Structure Tailwind utility classes in order: layout → box model → text →
  interactivity.
- Mobile-first by default.
- Extract reusable styles into class groups or components.

## Validation & Forms

- Use `zod` for all form schema validation.
- Use `react-hook-form` for form state.
- Pair `useActionState` with `next-safe-action` for server actions.
- Never use `try/catch` for expected errors – use return objects with
  `success: false`.

## Server Actions

- Use `next-safe-action` to define and validate server actions.
- All actions should return a consistent `ActionResponse` type.
- Validate with `zod`, type with `ActionResponse`, and use
  `createSafeActionClient`.

## Web3 stack

- Use `viem` + `wagmi` only in `client` components.
- Never embed private keys or sensitive logic on the frontend.
- Use `connectors`, `chains`, and `signers` from `wagmi` context.
- Organize wallet logic in `lib/wallet/` or `hooks/use-wallet.ts`.

## Performance

- Use `Suspense` + `fallback` for client components.
- Dynamically import heavy or non-critical components.
- Optimize images via `next/image` using WebP, placeholder, and responsive
  sizes.

## Files & Naming

- Folder names in kebab-case.
- Component files: `component.tsx`, `types.ts`, `content.ts`, `helpers.ts`
- Hooks: `useX.ts` with named exports.
- Shared types: in `types/` or colocated with features.

## Accessibility & UI

- Use Shadcn UI components or Radix UI primitives.
- Ensure keyboard accessibility by default.
- Use Tailwind Aria utilities when needed.
- Avoid div soup. Use semantic tags where possible.
