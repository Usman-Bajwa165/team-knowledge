// backend/src/auth/admin.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

interface JwtUser {
  id: number;
  email?: string;
  role?: string;
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as JwtUser | undefined;
    if (!user) return false; // no authenticated user
    if (user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
