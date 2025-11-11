// backend/src/admin/admin.controller.ts
import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Post,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import * as bcrypt from 'bcryptjs';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
  ) {}

  // list users with article counts
  @Get('users')
  async listUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { KnowledgeArticle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      articleCount: u._count.KnowledgeArticle || 0,
    }));
  }

  // promote/demote
  @Patch('users/:id/role')
  async changeRole(
    @Param('id') id: string,
    @Body() body: { role: 'admin' | 'user' },
  ) {
    const role = body.role;
    if (!['admin', 'user'].includes(role))
      throw new BadRequestException('Invalid role');
    const user = await this.usersService.findById(Number(id));
    if (!user) throw new BadRequestException('User not found');
    await this.prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    return { ok: true };
  }

  // create a new user (admin creates account)
  @Post('users')
  async createUser(
    @Body() body: { email: string; name?: string; password?: string },
  ) {
    const existing = await this.usersService.findByEmail(body.email);
    if (existing) throw new BadRequestException('Email already exists');
    const pwd = body.password ?? Math.random().toString(36).slice(2, 10);
    const hashed = await bcrypt.hash(pwd, 12);
    const user = await this.prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        name: body.name || null,
        password: hashed,
      },
    });
    return {
      ok: true,
      user: { id: user.id, email: user.email, name: user.name },
      password: pwd,
    }; // return password so admin can send to user
  }

  // delete user and optionally cascade remove articles/comments
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    const userId = Number(id);
    await this.prisma.$transaction([
      this.prisma.knowledgeComment.deleteMany({ where: { authorId: userId } }),
      this.prisma.knowledgeArticle.deleteMany({ where: { authorId: userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
    return { ok: true };
  }
}
