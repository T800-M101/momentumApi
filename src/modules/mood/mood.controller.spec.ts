import { Test, TestingModule } from '@nestjs/testing';
import { MoodController } from './mood.controller';
import { MoodService } from './mood.service';
import { MoodRepository } from './mood.repository';

describe('MoodController', () => {
  let controller: MoodController;

 beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoodController],
      providers: [
        MoodService,
        {
          provide: MoodRepository,
          useValue: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<MoodController>(MoodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
