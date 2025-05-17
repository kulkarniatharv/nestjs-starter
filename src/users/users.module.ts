import { PrismaModule } from '@/prisma/prisma.module';
import { UsersController } from '@/users/users.controller';
import { UsersService } from '@/users/users.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
