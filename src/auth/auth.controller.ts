import { AuthService } from '@/auth/auth.service';
import { LoginDto, LoginSchema, SignUpDto, SignUpSchema } from '@/auth/dto';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body(new ZodValidationPipe(SignUpSchema)) body: SignUpDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginDto) {
    return this.authService.login(body);
  }
}
