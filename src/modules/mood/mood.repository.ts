import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma-service'; // Ajusta la ruta a tu PrismaService
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';


@Injectable()
export class MoodRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMoodDto: CreateMoodDto) {
    return this.prisma.mood.create({
      data: {
        label: createMoodDto.label, 
        emoji: createMoodDto.emoji, 
      },
    });
  }

  async findAll() {
    return this.prisma.mood.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.mood.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateMoodDto: UpdateMoodDto) {
    return this.prisma.mood.update({
      where: { id },
      data: {
        ...updateMoodDto, 
      },
    });
  }

  async remove(id: number) {
    return this.prisma.mood.delete({
      where: { id },
    });
  }
}