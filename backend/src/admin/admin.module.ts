// backend/src/admin/admin.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';

@Module({
  imports: [PrismaModule, UsersModule, forwardRef(() => AuthModule)],
  controllers: [AdminController],
  providers: [AdminGuard],
  exports: [],
})
export class AdminModule {}
