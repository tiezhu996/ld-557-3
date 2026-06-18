import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../constants/enums';
import { CurrentUser } from '../../types/request';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: CurrentUser }>();
    return request.user?.role === UserRole.ADMIN || Boolean(request.user);
  }
}

