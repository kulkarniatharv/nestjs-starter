import { PrismaModule } from '@/prisma/prisma.module';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
