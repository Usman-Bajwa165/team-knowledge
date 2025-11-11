// backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  get() {
    return { status: 'ok', time: new Date().toISOString() };
  }

  @Get('db')
  async db() {
    const ok = await this.prisma.dbCheck();
    return { db: ok ? 'ok' : 'error', checkedAt: new Date().toISOString() };
  }
}
