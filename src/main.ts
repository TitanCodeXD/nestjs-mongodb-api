import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

//Swagger
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

//Para validar o DTO Class Validator
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API for studying NestJS, MongoDB, Swagger, Redis and Jest')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  //Swagger
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
