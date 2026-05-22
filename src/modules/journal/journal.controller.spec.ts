import { Test, TestingModule } from '@nestjs/testing';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './journal.repository';

describe('JournalController', () => {
  let controller: JournalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JournalController],
      providers: [
        JournalService,
        {
          provide: JournalRepository,
          useValue: { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<JournalController>(JournalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
