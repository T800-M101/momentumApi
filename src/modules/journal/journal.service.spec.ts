import { Test, TestingModule } from '@nestjs/testing';
import { JournalService } from './journal.service';
import { JournalRepository } from './journal.repository';
import { CreateEntryDto } from './dto/create-entry.dto';

describe('JournalService', () => {
  let service: JournalService;
  let repository: JournalRepository;

  const mockJournalRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    getUserStats: jest.fn(),
    checkMoodExists: jest.fn(), 
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalService,
        {
          provide: JournalRepository,
          useValue: mockJournalRepository,
        },
      ],
    }).compile();

    service = module.get<JournalService>(JournalService);
    repository = module.get<JournalRepository>(JournalRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully map and save a new entry linked to the current user', async () => {
      const dto: CreateEntryDto = {
        title: 'Backend Testing',
        content: 'Writing unit tests with Jest mocks.',
        moodId: 1,
        tags: ['nest', 'testing'],
        date: '2026-05-22', 
      };
      const userId = 'user-uuid-123';
      
      // El resultado final que simula la base de datos ya guardada
      const expectedSavedResult = { id: 'entry-uuid', ...dto, userId };

      mockJournalRepository.checkMoodExists.mockResolvedValue(true);
      mockJournalRepository.create.mockResolvedValue(expectedSavedResult);

      const result = await service.create(dto, userId);

      expect(result).toEqual(expectedSavedResult);
      expect(repository.checkMoodExists).toHaveBeenCalledWith(dto.moodId);
      expect(repository.create).toHaveBeenCalledWith(
        dto,
        userId,
        [
          { where: { name: 'nest' }, create: { name: 'nest' } },
          { where: { name: 'testing' }, create: { name: 'testing' } }
        ]
      );
    });
  });
}); 