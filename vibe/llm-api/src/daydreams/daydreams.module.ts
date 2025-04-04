import { Module } from '@nestjs/common';
import { DaydreamsAgentProvider } from './agent.provider';

@Module({
  providers: [DaydreamsAgentProvider],
  exports: [DaydreamsAgentProvider]
})
export class DaydreamsModule {}