import { Authenticated } from '@/auth/decorators/authenticated.decorator';
import { AuthenticatedUser, CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UsersService } from '@/users/users.service';
import { Controller, Get, NotFoundException, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authenticated()
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }
}
