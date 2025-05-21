import { Authenticated } from '@/auth/decorators/authenticated.decorator';
import { CurrentUser, SanitizedUser } from '@/auth/decorators/current-user.decorator';
import { UsersService } from '@/users/users.service';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

@Controller('users')
@Authenticated()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: SanitizedUser) {
    return { user };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...sanitizedUser } = user;
    return { user: sanitizedUser };
  }
}
