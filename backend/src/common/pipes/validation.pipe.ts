import { ValidationPipe } from '@nestjs/common';

export const appValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidUnknownValues: true,
});

