import { string, z, ZodAny } from "zod";
import type { AnyAgent, WorkingMemory } from "./types";

export type Instruction = string | string[];

export type Context<
  Memory extends WorkingMemory = WorkingMemory,
  Args extends z.ZodTypeAny = never,
  Ctx = any,
  Exports = any,
> = {
  type: string;
  args: Args;
  key: (args: z.infer<Args>) => string;

  setup: (args: z.infer<Args>, agent: AnyAgent) => Promise<Ctx> | Ctx;

  instructions?:
    | Instruction
    | ((params: { key: string; args: Args }, ctx: Ctx) => Instruction);

  // memory
  create?: (params: { key: string; args: Args }, ctx: Ctx) => Memory;
  load?: (params: { key: string; args: Args }, ctx: Ctx) => Promise<Memory>;
  save?: (
    params: {
      key: string;
      args: Args;
      memory: Memory;
    },
    ctx: Ctx
  ) => Promise<void>;

  render?: (memory: Memory, ctx: Ctx) => string | string[];

  exports?: () => Exports;
};

export type AnyContext = Context<any, any, any, any>;

export function context<
  Memory extends WorkingMemory = WorkingMemory,
  Args extends z.ZodTypeAny = any,
  Ctx = any,
  Exports = any,
>(ctx: Context<Memory, Args, Ctx, Exports>) {
  return ctx;
}

// const test = context({
//   type: "discord:channel",
//   args: z.string(),
//   key: (channelId) => channelId,
//   setup(channelId) {
//     return {
//       channel: {
//         title: "Yes",
//       },
//     };
//   },
//   create(key, channelId, ctx) {
//     return {
//       channel: {
//         id: channelId,
//         title: ctx.channel.title,
//       },
//     };
//   },
//   // async load(key, args, ctx) {},
//   // async save(key, args, memory, ctx) {},
//   render(memory, ctx) {
//     return [];
//   },
// });

// const discordChannelContext = context({
//   type: "discord:channel",
//   key: (channelId: string) => ["discord:channel", channelId],
//   initializer: async (channelId: string, agent: AnyAgent) => {
//     const discord = agent.container.resolve<DiscordClient["client"]>("discord");
//     const channel = await discord.channels.fetch(channelId);

//     return {
//       channel,
//     };
//   },

//   extends: [defaultContext],
//   create: (channelId: string) => {
//     return {};
//   },

//   load: async () => {},
//   save: async () => {},
// });

// const cliContext = context({
//   type: "cli",
//   key: (screenId: string) => ["cli", screenId],
//   initializer: async (screenId: string, agent: AnyAgent) => {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });

//     return {
//       rl,
//     };
//   },
//   create: () => {},
//   format: () => {},
//   save: () => {},
//   handler: async ({ screenId, rl }, agent: AnyAgent) => {
//     while (true) {
//       const input = await rl.question(">");

//       const contextId = "my-research-" + Date.now();

//       await agent.send(contextId, {
//         type: "message",
//         data: {
//           user: "Galego",
//           text: input,
//         },
//       });

//       break;
//     }
//   },
// });

// const screen = agent.create(cli, 1);
