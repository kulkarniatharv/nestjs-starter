import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const user = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sanitizedUser = (({ password, ...rest }) => rest)(user);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getMe', () => {
    it('should return the current user', () => {
      expect(controller.getMe(sanitizedUser)).toEqual({ user: sanitizedUser });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      vi.spyOn(usersService, 'findById').mockResolvedValue(user as any);
      const result = await controller.getUserById(user.id);
      expect(result).toEqual({ user: sanitizedUser });
    });
    it('should throw NotFoundException if not found', async () => {
      vi.spyOn(usersService, 'findById').mockResolvedValue(null);
      await expect(controller.getUserById(user.id)).rejects.toThrow(NotFoundException);
    });
  });
});
