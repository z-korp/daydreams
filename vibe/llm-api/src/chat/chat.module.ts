import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService],
  exports: [ChatService], // ← important pour l'injecter ailleurs
})
export class ChatModule {}
