import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { swaggerInitializer } from './config/config.swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // initializing the config service to access environment variables
  const configService = app.get(ConfigService);

  const port = configService.get('APP_PORT');
  const logger = new Logger();

  // swagger documentation
  swaggerInitializer(app);

  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(port);
  logger.log(`Application is running on ${await app.getUrl()}`);
}
bootstrap();
