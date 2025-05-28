import { ClerkStrategy } from '@/auth/clerk.strategy';
import { ClerkClientProvider } from '@/providers/clerk-client.provider';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'clerk' }), ConfigModule],
  providers: [ClerkStrategy, ClerkClientProvider],
  exports: [PassportModule],
})
export class AuthModule {}
