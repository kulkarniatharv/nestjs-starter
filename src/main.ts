import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false, // disable default logger
  });
  app.useLogger(app.get('Logger'));
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
