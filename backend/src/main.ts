// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

async function ensureAdmin(prisma: PrismaService) {
  const adminEmail = 'admin@gmail.com';
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: 'Admin',
        role: 'admin',
        emailVerified: true,
      },
    });
    console.log('Admin user created: admin@gmail.com / admin123');
  } else {
    // ensure role and emailVerified
    if (existing.role !== 'admin' || !existing.emailVerified) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'admin', emailVerified: true },
      });
      console.log('Admin user normalized (role/emailVerified updated).');
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ensure database ready and seed admin
  const prisma = app.get(PrismaService);
  try {
    const ok = await prisma.dbCheck();
    if (!ok)
      console.warn(
        'Prisma DB check failed — continue and Prisma will surface errors.',
      );
  } catch (err) {
    console.warn('Prisma dbCheck threw:', err);
  }
  await ensureAdmin(prisma);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
