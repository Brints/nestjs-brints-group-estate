import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function swaggerInitializer(app: INestApplication<any>) {
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
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}
