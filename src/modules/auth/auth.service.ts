import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dtos/register.dto';
import { UserRepository } from './auth.repository';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository, 
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.userRepo.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException('This email address is already in use.');
    }

    const usernameExists = await this.userRepo.findByUsername(dto.username);
    if (usernameExists) {
      throw new ConflictException('This username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepo.createUser(dto, hashedPassword);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByIdentifier(dto.identifier);

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret:
            this.config.get('JWT_ACCESS_SECRET') ||
            this.config.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.userRepo.findById(userId);
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    const hash = await bcrypt.hash(rt, 10);
    await this.userRepo.updateRefreshToken(userId, hash);
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.userRepo.clearRefreshTokenForActiveUser(userId);
    return { success: true };
  }
}