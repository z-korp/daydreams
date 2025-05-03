import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DaydreamsService } from "./daydreams.service.js";
import { DaydreamsController } from "./daydreams.controller.js";
import { TemplateService } from "./template.service.js";
import { TemplateController } from "./template.controller.js";

@Module({
  imports: [ConfigModule],
  providers: [DaydreamsService, TemplateService],
  exports: [DaydreamsService, TemplateService],
  controllers: [DaydreamsController, TemplateController],
})
export class DaydreamsModule {}
