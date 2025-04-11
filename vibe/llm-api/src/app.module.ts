import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChatModule } from "./chat/chat.module";
import { LlmModule } from "./llm/llm.module";
import { LlmController } from "./llm/llm.controller";
import { DaydreamsAgentProvider } from "./daydreams/agent.provider";
import { DaydreamsModule } from "./daydreams/daydreams.module";
import { validateEnv } from "./config/config";
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
  providers: [AppService, DaydreamsAgentProvider],
})
export class AppModule {}
