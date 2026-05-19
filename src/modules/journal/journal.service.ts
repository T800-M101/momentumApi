import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateJournalDto } from './dto/update-entry.dto';
import { PrismaService } from 'src/prisma/prisma-service';
import { CreateEntryDto } from './dto/create-entry.dto';

@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto) {
    const { title, content, moodId, date, tags } = createEntryDto;

    const moodExists = await this.prisma.mood.findUnique({
      where: { id: moodId },
    });

    if (!moodExists) {
      throw new NotFoundException(`El Mood con ID ${moodId} no existe.`);
    }

    const tagsUpdate =
      tags?.map((tagName) => ({
        where: { name: tagName.toLowerCase().trim() },
        create: { name: tagName.toLowerCase().trim() },
      })) || [];

    return this.prisma.entry.create({
      data: {
        title,
        content,
        date: new Date(date),
        mood: {
          connect: { id: moodId },
        },
        tags: {
          connectOrCreate: tagsUpdate,
        },
      },
      include: {
        mood: true,
        tags: true,
      },
    });
  }

  async findAll() {
    return this.prisma.entry.findMany({
      include: {
        images: true,
        tags: true,
        mood: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} journal`;
  }

  update(id: number, updateJournalDto: UpdateJournalDto) {
    return `This action updates a #${id} journal`;
  }

  remove(id: number) {
    return `This action removes a #${id} journal`;
  }
}
