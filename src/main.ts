import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { json, Request } from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false, // disable default logger
  });
  app.useLogger(app.get(Logger));

  // Configure raw body parsing for webhooks
  app.use(
    '/api/users/webhooks/clerk',
    json({
      verify: (req: Request & { rawBody?: Buffer }, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
