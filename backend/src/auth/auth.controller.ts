// backend/src/auth/auth.controller.ts
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
  Query,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

interface JwtPayload {
  sub: number;
  email?: string;
  role?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService, // Prisma injected so controller can check tokens directly
  ) {}

  // register
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.usersService.createUser(dto);
    return { ok: true, user: { id: user.id, email: user.email } };
  }

  // login
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) return { error: 'Invalid credentials' };

    const tokens = await this.authService.login(user);

    // set refresh token cookie (optional)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  // refresh tokens
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { userId: number; refreshToken: string }) {
    const { userId, refreshToken } = body;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // verify email token
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload?.sub) {
        return { error: 'Invalid token payload' };
      }
      await this.usersService.markEmailVerified(payload.sub);
      return { ok: true };
    } catch (error) {
      return { error: 'Invalid or expired token' };
    }
  }

  // protected: get current user
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    // passport attached user on req.user (JwtStrategy validate returns { id, email, role })
    return { user: req.user };
  }

  // logout - clear refresh token hash server side
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: { userId: number }) {
    await this.usersService.setRefreshTokenHash(body.userId, null);
    return { ok: true };
  }

  // forgot-password: create reset token (sends email or logs link)
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    const { email } = body;
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // 404 for frontend to show "email not found"
      return { statusCode: 404, message: 'Email not found' };
    }

    // create and send token (AuthService handles token creation & email sending)
    await this.authService.createPasswordResetToken(email);
    return { ok: true, message: 'Password reset link sent to provided email' };
  }

  // reset-password: consume token and set new password
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      await this.authService.resetPasswordUsingToken(body.token, body.password);
      return { ok: true };
    } catch (err) {
      // err should be Error with message set in AuthService
      const message = err instanceof Error ? err.message : 'Invalid token';
      return { statusCode: 400, message };
    }
  }

  /**
   * NEW: check-reset-token
   * Verifies a reset token exists, is not used, and is not expired.
   * GET /auth/check-reset-token?token=<rawToken>
   *  - 200 OK => { ok: true }
   *  - 400/404 => throws appropriate exception (frontend should treat as expired/invalid)
   */
  @Get('check-reset-token')
  async checkResetToken(@Query('token') rawToken?: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new BadRequestException('token required');
    }

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const tokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      throw new NotFoundException('Invalid token');
    }
    if (tokenRecord.used) {
      throw new BadRequestException('Token already used');
    }
    if (tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    return { ok: true };
  }

  /**
   * NEW: check-email
   * GET /auth/check-email?email=...
   * returns 200 OK if email exists, 404 if not (frontend expects this behavior).
   */
  @Get('check-email')
  async checkEmail(@Query('email') email?: string) {
    if (!email || typeof email !== 'string') {
      throw new BadRequestException('email query required');
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Email not found');
    return { ok: true };
  }
}
