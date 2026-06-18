import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('FinanceAPI')
  .setDescription('金融投资分析平台 API 文档')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();
