import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const payload = exception.getResponse();

    response.status(statusCode).json({
      statusCode,
      message: typeof payload === 'string' ? payload : (payload as { message?: unknown }).message,
      error: exception.name,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

