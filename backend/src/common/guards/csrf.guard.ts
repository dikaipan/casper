import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * CSRF Protection Guard
 * 
 * Note: For JWT-based APIs, CSRF is less critical since tokens are stored
 * in localStorage/memory (not cookies). However, this guard provides
 * additional protection for state-changing operations.
 * 
 * For production, consider:
 * - Using SameSite cookies if switching to cookie-based auth
 * - Implementing double-submit cookie pattern
 * - Using Origin/Referer header validation
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Skip CSRF check for API endpoints that use JWT (already protected)
    // CSRF is mainly for cookie-based sessions
    // Since we use JWT in Authorization header, CSRF risk is minimal
    
    // However, we can validate Origin header for additional security
    if (isProduction) {
      const origin = request.headers.origin;
      const referer = request.headers.referer;
      const allowedOrigin = this.configService.get<string>('CORS_ORIGIN');

      if (allowedOrigin && origin && origin !== allowedOrigin) {
        throw new ForbiddenException('Invalid origin');
      }

      // Validate Referer header for additional protection
      if (referer && allowedOrigin && !referer.startsWith(allowedOrigin)) {
        throw new ForbiddenException('Invalid referer');
      }
    }

    return true;
  }
}

