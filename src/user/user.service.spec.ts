import { PrismaService } from '@/prisma/prisma.service';
import { ClerkUserData } from '@/user/dto/clerk-webhook.dto';
import { UserService } from '@/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleClerkUserCreated', () => {
    it('should throw error when no primary email address is found', async () => {
      const clerkUserData: ClerkUserData = {
        id: 'user_123',
        object: 'user',
        username: 'johndoe',
        first_name: 'John',
        last_name: 'Doe',
        image_url: null,
        created_at: Date.now(),
        updated_at: Date.now(),
        last_sign_in_at: null,
        external_id: null,
        email_addresses: [],
        phone_numbers: [],
        primary_email_address_id: 'nonexistent_email',
        primary_phone_number_id: null,
      };

      await expect(service.handleClerkUserCreated(clerkUserData)).rejects.toThrow(
        'No primary email address found for user',
      );
    });
  });
});
