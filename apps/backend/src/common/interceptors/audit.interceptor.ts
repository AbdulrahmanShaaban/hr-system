import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../core/database/prisma.service';

interface AuditResponse {
  id?: string;
  [key: string]: unknown;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;

    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!sensitiveMethods.includes(method)) {
      return next.handle();
    }

    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap(async (responseBody: AuditResponse) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              tenantId: user?.tenantId || 'system',
              userId: user?.id || 'anonymous',
              action: `${method} ${url}`,
              entity: url.split('/')[2] || 'unknown',
              entityId: responseBody?.id,
              newValues: responseBody as unknown as Record<string, string>,
              ipAddress: ip,
              userAgent,
            },
          });
        } catch {
          // Silently fail audit logging to not break the request
        }
      }),
    );
  }
}
