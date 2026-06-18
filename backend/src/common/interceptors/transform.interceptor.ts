import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ url: string }>();
    return next.handle().pipe(
      map((data) => ({
        statusCode: 200,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}

