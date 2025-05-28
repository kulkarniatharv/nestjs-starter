import { AppService } from '@/app.service';
import { Public } from '@/auth/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
