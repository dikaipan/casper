import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityLoggerService {
  /**
   * Log security events for audit trail
   */
  logSecurityEvent(
    event: string,
    details: {
      userId?: string;
      username?: string;
      ip?: string;
      userAgent?: string;
      action?: string;
      resource?: string;
      status?: 'SUCCESS' | 'FAILED' | 'BLOCKED';
      reason?: string;
    },
  ) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      ...details,
    };

    // In production, this should be sent to a proper logging service (e.g., Winston, Pino, CloudWatch)
    console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);

    // TODO: Implement proper logging to file or external service
    // Example: await this.loggingService.log(logEntry);
  }

  logLoginAttempt(username: string, ip: string, status: 'SUCCESS' | 'FAILED', reason?: string) {
    this.logSecurityEvent('LOGIN_ATTEMPT', {
      username,
      ip,
      action: 'LOGIN',
      status,
      reason,
    });
  }

  logUnauthorizedAccess(userId: string, resource: string, ip: string) {
    this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
      userId,
      resource,
      ip,
      status: 'BLOCKED',
      reason: 'Insufficient permissions',
    });
  }

  logPasswordChange(userId: string, username: string, ip: string) {
    this.logSecurityEvent('PASSWORD_CHANGE', {
      userId,
      username,
      ip,
      action: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
    });
  }

  logSensitiveOperation(userId: string, action: string, resource: string, ip: string) {
    this.logSecurityEvent('SENSITIVE_OPERATION', {
      userId,
      action,
      resource,
      ip,
      status: 'SUCCESS',
    });
  }
}

