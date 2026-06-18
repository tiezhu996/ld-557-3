import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '../../constants/enums';
import { AuditService } from '../../modules/audit/audit.service';
import { CurrentUser } from '../../types/request';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      user?: CurrentUser;
      body?: Record<string, unknown>;
    }>();
    return next.handle().pipe(
      tap(() => {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) return;
        const action = request.method === 'POST' ? AuditAction.CREATE : request.method === 'DELETE' ? AuditAction.DELETE : AuditAction.UPDATE;
        this.auditService.log({
          userId: request.user?.id,
          action,
          target: request.url.split('?')[0],
          newValue: request.body,
          ip: request.ip,
          userAgent: String(request.headers['user-agent'] ?? ''),
        });
      }),
    );
  }
}

