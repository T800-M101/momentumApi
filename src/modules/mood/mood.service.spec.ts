import { Test, TestingModule } from '@nestjs/testing';
import { MoodService } from './mood.service';
import { MoodRepository } from './mood.repository';
import { NotFoundException } from '@nestjs/common';

describe('MoodService', () => {
  let service: MoodService;
  let repository: MoodRepository;

  // Creamos un Mock del repositorio con Jest
  const mockMoodRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodService,
        {
          provide: MoodRepository,
          useValue: mockMoodRepository,
        },
      ],
    }).compile();

    service = module.get<MoodService>(MoodService);
    repository = module.get<MoodRepository>(MoodRepository);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpia el historial de llamadas entre pruebas
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of moods ordered by id', async () => {
      const expectedMoods = [{ id: 1, label: 'Productive', emoji: '🚀' }];
      mockMoodRepository.findAll.mockResolvedValue(expectedMoods);

      const result = await service.findAll();

      expect(result).toEqual(expectedMoods);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single mood if found', async () => {
      const targetMood = { id: 3, label: 'Happy', emoji: '😊' };
      mockMoodRepository.findOne.mockResolvedValue(targetMood);

      const result = await service.findOne(3);

      expect(result).toEqual(targetMood);
      expect(repository.findOne).toHaveBeenCalledWith(3);
    });

    it('should throw a NotFoundException if mood does not exist', async () => {
      mockMoodRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });
});