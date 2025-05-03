import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { LlmController } from "./llm.controller.js";
import { DaydreamsModule } from "../daydreams/daydreams.module.js";

@Module({
  imports: [HttpModule, DaydreamsModule],
  controllers: [LlmController],
})
export class LlmModule {}
