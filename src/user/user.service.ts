import { PrismaService } from '@/prisma/prisma.service';
import { ClerkUserData, ClerkWebhookEventDto } from '@/user/dto/clerk-webhook.dto';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { User } from '@/user/interfaces/user.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import { Webhook } from 'svix';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async verifyAndProcessWebhook(
    req: RawBodyRequest<Request>,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
  ): Promise<{ success: boolean }> {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing required webhook headers');
    }

    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('CLERK_WEBHOOK_SECRET not configured');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }

    try {
      const wh = new Webhook(webhookSecret);
      const payload = wh.verify(req.rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEventDto;

      await this.processWebhookEvent(payload);

      return { success: true };
    } catch (error) {
      this.logger.error('Webhook verification or processing failed:', error);
      throw new BadRequestException('Invalid webhook signature or payload');
    }
  }

  private async processWebhookEvent(event: ClerkWebhookEventDto): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type} for user: ${event.data.id}`);

    try {
      switch (event.type) {
        case 'user.created':
          await this.handleClerkUserCreated(event.data);
          this.logger.log(`User created from webhook: ${event.data.id}`);
          break;

        case 'user.updated':
          await this.handleClerkUserUpdated(event.data);
          this.logger.log(`User updated from webhook: ${event.data.id}`);
          break;

        case 'user.deleted':
          await this.handleClerkUserDeleted(event.data.id);
          this.logger.log(`User deleted from webhook: ${event.data.id}`);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event.type}:`, error);
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const userData: Prisma.UserCreateInput = {
        id: createUserDto.id,
        email: createUserDto.email,
        firstName: createUserDto.firstName ?? null,
        lastName: createUserDto.lastName ?? null,
        username: createUserDto.username ?? null,
        imageUrl: createUserDto.imageUrl ?? null,
        emailVerified: createUserDto.emailVerified,
        phoneNumber: createUserDto.phoneNumber ?? null,
        externalId: createUserDto.externalId ?? null,
      };

      if (createUserDto.lastSignInAt) {
        userData.lastSignInAt = new Date(createUserDto.lastSignInAt);
      }

      const user = await this.prisma.user.create({
        data: userData,
      });

      this.logger.log(`User created: ${user.id}`);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User with this email or username already exists');
      }
      this.logger.error(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const updateData: Prisma.UserUpdateInput = {
        ...updateUserDto,
        firstName: updateUserDto.firstName ?? undefined,
        lastName: updateUserDto.lastName ?? undefined,
        username: updateUserDto.username ?? undefined,
        imageUrl: updateUserDto.imageUrl ?? undefined,
        phoneNumber: updateUserDto.phoneNumber ?? undefined,
        externalId: updateUserDto.externalId ?? undefined,
      };

      if (updateUserDto.lastSignInAt) {
        updateData.lastSignInAt = new Date(updateUserDto.lastSignInAt);
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(`User updated: ${user.id}`);
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      this.logger.error(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      this.logger.log(`User deleted: ${id}`);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      this.logger.error(
        `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async handleClerkUserCreated(clerkUserData: ClerkUserData): Promise<User> {
    // Get primary email address
    const primaryEmail = clerkUserData.email_addresses.find(
      (email) => email.id === clerkUserData.primary_email_address_id,
    );

    if (!primaryEmail) {
      throw new Error('No primary email address found for user');
    }

    // Get primary phone number
    const primaryPhone = clerkUserData.phone_numbers.find(
      (phone) => phone.id === clerkUserData.primary_phone_number_id,
    );

    const createUserDto: CreateUserDto = {
      id: clerkUserData.id,
      email: primaryEmail.email_address,
      firstName: clerkUserData.first_name || undefined,
      lastName: clerkUserData.last_name || undefined,
      username: clerkUserData.username || undefined,
      imageUrl: clerkUserData.image_url || undefined,
      lastSignInAt: clerkUserData.last_sign_in_at
        ? new Date(clerkUserData.last_sign_in_at).toISOString()
        : undefined,
      emailVerified: primaryEmail.verification.status === 'verified',
      phoneNumber: primaryPhone?.phone_number,
      externalId: clerkUserData.external_id || undefined,
    };

    return this.createUser(createUserDto);
  }

  async handleClerkUserUpdated(clerkUserData: ClerkUserData): Promise<User> {
    // Get primary email address
    const primaryEmail = clerkUserData.email_addresses.find(
      (email) => email.id === clerkUserData.primary_email_address_id,
    );

    if (!primaryEmail) {
      throw new Error('No primary email address found for user');
    }

    // Get primary phone number
    const primaryPhone = clerkUserData.phone_numbers.find(
      (phone) => phone.id === clerkUserData.primary_phone_number_id,
    );

    const updateUserDto: UpdateUserDto = {
      email: primaryEmail.email_address,
      firstName: clerkUserData.first_name || undefined,
      lastName: clerkUserData.last_name || undefined,
      username: clerkUserData.username || undefined,
      imageUrl: clerkUserData.image_url || undefined,
      lastSignInAt: clerkUserData.last_sign_in_at
        ? new Date(clerkUserData.last_sign_in_at).toISOString()
        : undefined,
      emailVerified: primaryEmail.verification.status === 'verified',
      phoneNumber: primaryPhone?.phone_number,
      externalId: clerkUserData.external_id || undefined,
    };

    return this.updateUser(clerkUserData.id, updateUserDto);
  }

  async handleClerkUserDeleted(userId: string): Promise<void> {
    return this.deleteUser(userId);
  }
}
