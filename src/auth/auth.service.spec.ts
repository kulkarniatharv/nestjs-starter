import { UsersService } from '@/users/users.service';
import {
    ConflictException,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PinoLogger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const user: User = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: vi.fn(),
            findByEmail: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: vi.fn(),
          },
        },
        {
          provide: PinoLogger,
          useValue: { error: () => {} },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signup', () => {
    it('should signup a user', async () => {
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      vi.spyOn(usersService, 'createUser').mockResolvedValue(user);
      const dto = { email: user.email, password: 'password', name: user.name };
      const result = await service.signup(dto);
      expect(result.data.user).toMatchObject({ id: user.id, email: user.email, name: user.name });
      expect(result.data.message).toBe('Signup successful');
    });
    it('should throw ConflictException on P2002', async () => {
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      // @ts-expect-error: Testing error instance
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', 'P2002');
      vi.spyOn(usersService, 'createUser').mockRejectedValue(error);
      const dto = { email: user.email, password: 'password', name: user.name };
      await expect(service.signup(dto)).rejects.toThrow(ConflictException);
    });
    it('should throw InternalServerErrorException on unknown error', async () => {
      vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      vi.spyOn(usersService, 'createUser').mockRejectedValue(new Error('fail'));
      const dto = { email: user.email, password: 'password', name: user.name };
      await expect(service.signup(dto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should login and return accessToken', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      vi.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      const dto = { email: user.email, password: 'password' };
      const result = await service.login(dto);
      expect(result.data.accessToken).toBe('token');
      expect(result.data.message).toBe('Login successful');
    });
    it('should throw UnauthorizedException if user not found', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const dto = { email: user.email, password: 'password' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
    it('should throw UnauthorizedException if password does not match', async () => {
      vi.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      const dto = { email: user.email, password: 'wrong' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('generateToken', () => {
    it('should generate a token', async () => {
      vi.spyOn(jwtService, 'signAsync').mockResolvedValue('token');
      const payload = { sub: user.id, email: user.email };
      await expect(service.generateToken(payload)).resolves.toBe('token');
    });
  });
});
