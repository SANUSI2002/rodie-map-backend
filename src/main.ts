import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HealthService } from './health/health.service';
import { HealthTrackingFilter } from './health/health-tracking.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.useGlobalFilters(new HealthTrackingFilter(app.get(HealthService)));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Roadimap API running on http://localhost:${port}/api`);
}
bootstrap();
