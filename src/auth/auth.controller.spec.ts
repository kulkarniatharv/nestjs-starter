import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: vi.fn(),
            login: vi.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signup', () => {
    it('should call authService.signup and return result', async () => {
      const dto = { email: 'test@example.com', password: 'password', name: 'Test User' };
      const result = {
        data: {
          message: 'Signup successful',
          user: {
            id: 'id',
            email: dto.email,
            name: dto.name,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };
      vi.spyOn(authService, 'signup').mockResolvedValue(result);
      const req = await controller.signup(dto as any);
      expect(req).toEqual({ data: result });
    });
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const dto = { email: 'test@example.com', password: 'password' };
      const result = { data: { message: 'Login successful', accessToken: 'token' } };
      vi.spyOn(authService, 'login').mockResolvedValue(result);
      const req = await controller.login(dto as any);
      expect(req).toEqual({ data: result });
    });
  });
});
