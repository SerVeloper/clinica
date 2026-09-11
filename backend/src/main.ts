import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuracionSwagger = new DocumentBuilder()
    .setTitle('API Clínica')
    .setDescription('Backend inicial para gestión de reservas clínicas')
    .setVersion('1.0.0')
    .build();

  const documento = SwaggerModule.createDocument(app, configuracionSwagger);
  SwaggerModule.setup('api/docs', app, documento);

  const puerto = Number(process.env.PUERTO ?? 3000);
  await app.listen(puerto);
}

void bootstrap();
