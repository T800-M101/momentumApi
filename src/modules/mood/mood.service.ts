import { Injectable } from '@nestjs/common';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { PrismaService } from 'src/prisma/prisma-service';

@Injectable()
export class MoodService {

  constructor(private prisma: PrismaService) {}

  create(createMoodDto: CreateMoodDto) {
    return 'This action adds a new mood';
  }

  findAll() {
    return this.prisma.mood.findMany({
      orderBy: { id: 'asc' }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} mood`;
  }

  update(id: number, updateMoodDto: UpdateMoodDto) {
    return `This action updates a #${id} mood`;
  }

  remove(id: number) {
    return `This action removes a #${id} mood`;
  }
}
