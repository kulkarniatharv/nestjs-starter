import { AuthService } from '@/auth/auth.service';
import { LoginDto, LoginSchema, SignUpDto, SignUpSchema } from '@/auth/dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body(new ZodValidationPipe(SignUpSchema)) body: SignUpDto) {
    const result = await this.authService.signup(body);
    return { data: result };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginDto) {
    const result = await this.authService.login(body);
    return { data: result };
  }
}
