import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { appValidationPipe } from './common/pipes/validation.pipe';
import { swaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(appValidationPipe);

  app.getHttpAdapter().get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'FinanceAPI',
      timestamp: new Date().toISOString(),
    });
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 38505);
  await app.listen(port);
}

bootstrap();

