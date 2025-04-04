import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { DaydreamsModule } from 'src/daydreams/daydreams.module';

@Module({
  imports: [HttpModule, DaydreamsModule],
  providers: [LlmService],
  exports: [LlmService],
  controllers: [LlmController],
})
export class LlmModule {}
