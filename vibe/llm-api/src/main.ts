import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();
  // Activer CORS pour permettre les requêtes du frontend
  app.enableCors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
