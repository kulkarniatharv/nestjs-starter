import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: vi.fn().mockReturnValue('Hello World!'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      const getHelloSpy = vi.spyOn(appService, 'getHello');
      expect(appController.getHello()).toBe('Hello World!');
      expect(getHelloSpy).toHaveBeenCalled();
    });
  });

  describe('health', () => {
    it('should return { status: "ok" }', () => {
      expect(appController.health()).toEqual({ status: 'ok' });
    });
  });
});
