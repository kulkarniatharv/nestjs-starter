import { PrismaService } from '@/prisma/prisma.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User } from '@prisma/client';
import { CreateUserInternalDto, UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const user: User = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      jest.spyOn(prisma.user, 'create').mockResolvedValue(user);
      const dto: CreateUserInternalDto = {
        email: user.email,
        hashedPassword: user.password,
        name: user.name,
      };
      await expect(service.createUser(dto)).resolves.toEqual(user);
    });
    it('should throw on unknown error', async () => {
      jest.spyOn(prisma.user, 'create').mockRejectedValue(new Error('fail'));
      const dto: CreateUserInternalDto = {
        email: user.email,
        hashedPassword: user.password,
        name: user.name,
      };
      await expect(service.createUser(dto)).rejects.toThrow(InternalServerErrorException);
    });
    it('should rethrow Prisma P2002 error', async () => {
      // @ts-expect-error: Testing error instance
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', 'P2002');
      jest.spyOn(prisma.user, 'create').mockRejectedValue(error);
      const dto: CreateUserInternalDto = {
        email: user.email,
        hashedPassword: user.password,
        name: user.name,
      };
      await expect(service.createUser(dto)).rejects.toBe(error);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    });
    it('should return null if not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.findByEmail(user.email)).resolves.toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      await expect(service.findById(user.id)).resolves.toEqual(user);
    });
    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.findById(user.id)).rejects.toThrow(NotFoundException);
    });
  });
});
