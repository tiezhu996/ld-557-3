import { Injectable } from '@nestjs/common';
import { AuditAction } from '../../constants/enums';

export interface AuditEvent {
  userId?: number;
  action: AuditAction;
  target: string;
  targetId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly events: Array<AuditEvent & { createdAt: string }> = [];

  log(event: AuditEvent) {
    this.events.push({ ...event, createdAt: new Date().toISOString() });
  }

  list() {
    return this.events.slice().reverse();
  }
}

