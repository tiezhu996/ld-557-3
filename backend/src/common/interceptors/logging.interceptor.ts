import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { logger } from '../../utils/logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const started = Date.now();
    return next.handle().pipe(
      tap(() => logger.info('request completed', {
        method: request.method,
        url: request.url,
        durationMs: Date.now() - started,
      })),
    );
  }
}

