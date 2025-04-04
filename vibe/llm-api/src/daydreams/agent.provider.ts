import { Provider } from '@nestjs/common';
import { createDreams, LogLevel } from '@daydreamsai/core';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

import { chatContext } from './context/chat.context';
import { addToChatHistory, clearChatHistory } from './actions/chat.action';
import { apiInput } from './inputs/chat.input';
import { chatOutput } from './outputs/chat.output';

const env = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
}).parse(process.env);

export const DaydreamsAgentProvider: Provider = {
  provide: 'DAYDREAMS_AGENT',
  useFactory: async () => {
    const anthropic = createAnthropic({ apiKey: env.ANTHROPIC_API_KEY });

    const agent = await createDreams({
      logger: LogLevel.INFO,
      model: anthropic("claude-3-7-sonnet-latest"),
      context: chatContext,
      actions: [addToChatHistory, clearChatHistory],
      inputs: { chat: apiInput },
      outputs: { "chat:response": chatOutput },
    }).start();

    return agent;
  },
};
