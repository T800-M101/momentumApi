import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma-service'; 
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });
  }

  async createUser(dto: RegisterDto, passwordHash: string) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: passwordHash,
      },
    });
  }

  async updateRefreshToken(userId: string, hash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }

  async clearRefreshTokenForActiveUser(userId: string) {
    return this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRt: {
          not: null,
        },
      },
      data: {
        hashedRt: null,
      },
    });
  }
}