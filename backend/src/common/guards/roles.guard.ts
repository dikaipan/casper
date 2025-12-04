import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, USER_TYPE_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredUserTypes = this.reflector.getAllAndOverride<string[]>(USER_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && !requiredUserTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    // Check user type
    if (requiredUserTypes && !requiredUserTypes.includes(user.userType)) {
      return false;
    }

    // Check roles
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return false;
    }

    return true;
  }
}

