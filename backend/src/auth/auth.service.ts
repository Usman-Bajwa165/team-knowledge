// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

function hashTokenSync(token: string) {
  // synchronous hashing — no need for async / await
  return createHash('sha256').update(token).digest('hex');
}

interface User {
  id: number;
  email: string;
  password: string;
  name?: string | null;
  role?: string;
  refreshTokenHash?: string | null;
}

interface JwtPayload {
  sub: number;
  email: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService, // <-- injected so we can use prisma.passwordResetToken
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Use JwtModule defaults for access token, but if you want a custom expiry you can add options.
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign({ sub: user.id }, {
      // keep this as string format (e.g. '7d')
      expiresIn: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
    } as any);

    await this.usersService.setRefreshTokenHash(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const valid = await this.usersService.verifyRefreshToken(
      userId,
      refreshToken,
    );
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.login(user);
  }

  // create a single-use reset token, triggers email (or logs link)
  async createPasswordResetToken(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const rawToken = randomBytes(24).toString('hex'); // plain token to email
    const tokenHash = hashTokenSync(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // send email (or console fallback)
    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/reset-password?token=${rawToken}`;

    // use instance method
    await this.sendResetEmail(user.email, user.name || 'User', resetUrl);

    return true;
  }

  async resetPasswordUsingToken(rawToken: string, newPassword: string) {
    const tokenHash = hashTokenSync(rawToken);
    const t = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
    if (!t) throw new Error('Invalid or expired token');
    if (t.used) throw new Error('Token already used');
    if (t.expiresAt < new Date()) throw new Error('Token expired');

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: t.userId },
      data: { password: hashed },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: t.id },
      data: { used: true },
    });

    return true;
  }

  // helper: send reset (uses SMTP if configured, else console.log)
  private async sendResetEmail(to: string, name: string, url: string) {
    const host = process.env.SMTP_HOST;
    if (!host) {
      console.log(`Password reset link for ${to}: ${url}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Team Knowledge" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Password reset for Team Knowledge',
      html: `<p>Hi ${name || 'User'},</p>
        <p>You requested a password reset for your Team Knowledge account. Click the link below to reset your password. This link is valid for 1 hour and can only be used once.</p>
        <p><a href="${url}">Reset password</a></p>
        <p>If you did not request this, ignore this email.</p>`,
    });
  }
}
