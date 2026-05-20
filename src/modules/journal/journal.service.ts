import { Injectable, NotFoundException } from '@nestjs/common';
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
      take: 20,
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

  async findOne(id: number) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
      include: {
        mood: true,
        tags: true,
      },
    });

    if (!entry) {
      throw new NotFoundException(
        `The journal entry with ID ${id} does not exist.`,
      );
    }

    return entry;
  }

  async update(id: number, updateEntryDto: CreateEntryDto) {
    const { title, content, moodId, date, tags } = updateEntryDto;

    await this.findOne(id);

    const moodExists = await this.prisma.mood.findUnique({
      where: { id: moodId },
    });
    if (!moodExists) {
      throw new NotFoundException(`The Mood with ID ${moodId} does not exist.`);
    }

    const tagsUpdate =
      tags?.map((tagName) => ({
        where: { name: tagName.toLowerCase().trim() },
        create: { name: tagName.toLowerCase().trim() },
      })) || [];

    return this.prisma.entry.update({
      where: { id },
      data: {
        title,
        content,
        date: new Date(date),
        mood: {
          connect: { id: moodId },
        },
        tags: {
          set: [],
          connectOrCreate: tagsUpdate,
        },
      },
      include: {
        mood: true,
        tags: true,
      },
    });
  }

  async remove(id: number) {
    const entry = await this.prisma.entry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(
        `The journal entry with ID ${id} does not exist.`,
      );
    }

    await this.prisma.entry.delete({
      where: { id },
    });

    return {
      success: true,
      message: `The journal entry with ID ${id} was removed successfully.`,
    };
  }
}
