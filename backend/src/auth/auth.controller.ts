import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  UseGuards,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
interface JwtPayload {
  sub: number;
  email?: string;
  role?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      console.log('REGISTER request body:', dto);
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing) throw new ConflictException('Email already in use');

      const user = await this.usersService.createUser(dto);
      console.log('REGISTER: user created id=', user.id);
      return { ok: true, user: { id: user.id, email: user.email } };
    } catch (err: unknown) {
      console.error('ERROR /auth/register (full):', err);
      // rethrow so Nest prints full stack + status 500
      throw err;
    }
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      if (!user) return { error: 'Invalid credentials' };

      const tokens = await this.authService.login(user);

      // Optionally set httpOnly refresh cookie:
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return tokens;
    } catch (err: unknown) {
      // narrow type to Error safely
      const error = err instanceof Error ? err : undefined;
      console.error(
        'ERROR /auth/login:',
        error?.stack ?? error?.message ?? err,
      );
      return { statusCode: 500, message: 'Internal server error' };
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { userId: number; refreshToken: string }) {
    const { userId, refreshToken } = body;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload.sub) {
        return { error: 'Invalid token payload' };
      }
      await this.usersService.markEmailVerified(payload.sub);
      return { ok: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { error: 'Invalid or expired token' };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return { user: req.user };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { userId: number }) {
    await this.usersService.setRefreshTokenHash(body.userId, null);
    return { ok: true };
  }
  // POST /auth/forgot-password
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    const { email } = body;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { statusCode: 404, message: 'Email not found' };
    }
    await this.authService.createPasswordResetToken(email);
    return { ok: true, message: 'Password reset link sent on provided email' };
  }

  // POST /auth/reset-password
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      await this.authService.resetPasswordUsingToken(body.token, body.password);
      return { ok: true };
    } catch (err) {
      // safe narrow to Error
      const message = err instanceof Error ? err.message : 'Invalid token';
      return { statusCode: 400, message };
    }
  }
}
