import { Public } from '@/auth/decorators/public.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { CreateUserDto, CreateUserSchema } from '@/user/dto/create-user.dto';
import { UpdateUserDto, UpdateUserSchema } from '@/user/dto/update-user.dto';
import { User } from '@/user/interfaces/user.interface';
import { UserService } from '@/user/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findUserById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Public()
  @Post('webhooks/clerk')
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ): Promise<{ success: boolean }> {
    return this.userService.verifyAndProcessWebhook(req, svixId, svixTimestamp, svixSignature);
  }
}
