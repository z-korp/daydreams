# Loot Survivor CLI agent

### Make sure you have your starknet env setup in root dir like usual

> check todo at the bottom to see current usage !

1. install deps in root

```bash
bun install`
```

then build core

```bash
cd packages/core/
bun run build
```

and also build the defai package located at `packages/defai`:

```bash
cd packages/defai
bun run build
```

then from root, to start the agent:

```bash
bun run examples/games/lootsurvivor/example-lootsurvivor.ts
```

TODO IMPORTANT

- fix the new game issue. CURRENTLY i have to start a new game manually, and
  then boot agent and say something like "You are adventurer 12345. YOu have
  already been created, so now explore"
- update max health state display
- item xp tracking (greatness)
- fix level display.
- market items and cost
