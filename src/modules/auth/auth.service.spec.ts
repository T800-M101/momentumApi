import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { UserRepository } from './auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: UserRepository;

  const mockUserRepository = {
    findByIdentifier: jest.fn(),
    updateRefreshToken: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mocked-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('secret-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<UserRepository>(UserRepository);
  });

  describe('login', () => {
    it('should throw ForbiddenException if user identifier is not registered', async () => {
      const dto: LoginDto = {
        identifier: 'nonexistent_user',
        password: 'Password123!',
      };
      
      mockUserRepository.findByIdentifier.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
      expect(userRepo.findByIdentifier).toHaveBeenCalledWith(dto.identifier);
    });
  });
});