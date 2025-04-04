# Global Rules – llm-api (NestJS + Daydreams)

You are working on a modular LLM backend using NestJS (CommonJS), and Daydreams as agent architecture. Your code is in TypeScript.

## Code style

- Use `function` declarations, not arrow functions, for top-level functions.
- Always type function signatures explicitly.
- Prefer `interface` over `type`, unless unions or mapped types are needed.
- Use kebab-case for folder names, and descriptive filenames (e.g., chat-session.service.ts).
- Use named exports for all non-NestJS modules.
- Avoid classes unless required by NestJS (e.g., Services, Controllers).

## Folder conventions

- `daydreams/contexts`: holds memory-driven Daydreams contexts.
- `daydreams/actions`: contains side-effect or state-mutating actions.
- `daydreams/inputs`: defines input handlers to connect external systems (e.g., HTTP, CLI).
- `llm/`: handles NestJS-level input/output logic, wraps the agent.
- `chat/`: optionally handles user/session logic or API-facing entities.

## Architecture rules

- The `agent.ts` file is declarative: never put logic in it. Just wire context, inputs, and actions.
- The service layer (`llm.service.ts`) is where you orchestrate the Daydreams agent.
- The controller layer only maps HTTP request to the service layer.
- Use Daydreams `.send()` to pass data to the agent, with a custom input.
- Handle errors using early return patterns and guard clauses.
- Keep business logic out of the controller.

## LLM-specific practices

- Contexts must have a clear `type`, `schema`, `key`, and `render` logic.
- Actions must validate input with Zod and mutate memory safely.
- Inputs must define `schema`, `format`, and optionally `subscribe`.
- Avoid deep nesting inside actions or input handlers.
- Never mutate state outside of Daydreams context memory.

## Misc

- Use Bun as your runtime.
- Place sensitive credentials in `.env` and load via `process.env`.
- Prefer `DTO`-style interfaces for service/controller params.
