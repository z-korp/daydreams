import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DaydreamsService } from "./daydreams.service.js";
import { DaydreamsController } from "./daydreams.controller.js";

@Module({
  imports: [ConfigModule],
  providers: [DaydreamsService],
  exports: [DaydreamsService],
  controllers: [DaydreamsController],
})
export class DaydreamsModule {}
