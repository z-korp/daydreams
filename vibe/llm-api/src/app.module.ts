import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { ChatModule } from "./chat/chat.module.js";
import { LlmModule } from "./llm/llm.module.js";
import { LlmController } from "./llm/llm.controller.js";
import { DaydreamsModule } from "./daydreams/daydreams.module.js";
import { validateEnv } from "./config/config.js";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ChatModule,
    LlmModule,
    DaydreamsModule,
    ConfigModule.forRoot({
      isGlobal: true, // rend la config accessible partout
      validate: validateEnv,
    }),
  ],
  controllers: [AppController, LlmController],
  providers: [AppService],
})
export class AppModule {}
