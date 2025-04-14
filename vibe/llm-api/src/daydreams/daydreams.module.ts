import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DaydreamsService } from "./daydreams.service.js";

@Module({
  imports: [ConfigModule],
  providers: [DaydreamsService],
  exports: [DaydreamsService],
})
export class DaydreamsModule {}
