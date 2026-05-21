import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma-service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) {
      throw new ConflictException('This email address is already in use.');
    }

    const usernameExists = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (usernameExists) {
      throw new ConflictException('This username is already taken.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username,
      },
    });

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
    // Look for a user where the input matches either the email OR the username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier }, // Checks if it matches an email row
          { username: dto.identifier }, // Checks if it matches a username row
        ],
      },
    });

    // Joint protection guard clause (keeps attackers guessing if the identifier or password was wrong)
    if (!user) throw new ForbiddenException('Access Denied');

    // Verify cryptography hash bounds
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    // Generate token payloads using our clean UUID String reference mapping
    const tokens = await this.getTokens(user.id, user.email);

    // We store the RT hash in the database
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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, user.hashedRt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRtHash(userId: string, rt: string): Promise<void> {
    // We hash the refresh token before saving it for security (Cybersecurity Best Practice)
    const hash = await bcrypt.hash(rt, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      },
    });
  }

  async logout(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null, // Only update if you already have an active token.
        },
      },
      data: {
        hashedRt: null, // We cleared the Refresh Token in Postgres
      },
    });

    return { success: true };
  }
}
