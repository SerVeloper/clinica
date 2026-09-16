import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const origen = config.get<string>('CORS_ORIGIN');
  if (!origen) throw new Error('CORS_ORIGIN es obligatorio para iniciar el servidor');

  app.enableCors({
    origin: origen,
    credentials: true,
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
