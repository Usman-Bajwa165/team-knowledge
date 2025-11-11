// backend/src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import type { StrategyOptions } from 'passport-jwt';

type JwtPayload = {
  sub: number;
  email?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ensure secret is always a string (fallback for dev)
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
    } as StrategyOptions;

    // passport-jwt types are strict; cast to any here to satisfy constructor signature
    super(opts as any);
  }

  // not async (no need for await) and payload is typed to avoid unsafe-any ESLint errors
  validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
