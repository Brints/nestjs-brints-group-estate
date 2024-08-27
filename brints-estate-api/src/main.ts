import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { initializeDataSource } from './database/data-source';

async function bootstrap() {
  await initializeDataSource();

  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  /**
   * Swagger configuration
   */
  const config = new DocumentBuilder()
    .setTitle('Brints Estate API')
    .setDescription(
      'The modern day Real Estate API simplifying the way we buy and sell properties',
    )
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://brints-estate-api.herokuapp.com', 'Production Server')
    .setTermsOfService('http://localhost:3001/terms')
    .setLicense(
      'MIT',
      'https://github.com/Brints/nestjs-brints-group-estate/blob/main/LICENSE',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3001);
  logger.log('Application started on http://localhost:3001');
}
bootstrap();
