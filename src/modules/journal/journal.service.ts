import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma-service';
import { Prisma } from '@prisma/client';
import { CreateEntryDto } from './dto/create-entry.dto';
import { STOP_WORDS } from 'src/constants/stop-words';


@Injectable()
export class JournalService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto, userId: string) {
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
    userId, 
    moodId: moodId, 

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

  async findAll(userId: string) {
    return this.prisma.entry.findMany({
      where: {
        userId: userId, // 🔒 Filtro maestro
      },
      take: 30,
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

  async findOne(id: string, userId: string) {
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

    if (entry.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this entry.');
    }

    return entry;
  }

  async findByDate(dateString: string, userId: string) {
    const inicioDia = new Date(`${dateString}T00:00:00.000Z`);
    const finDia = new Date(`${dateString}T23:59:59.999Z`);

    return await this.prisma.entry.findMany({
      where: {
        userId: userId, 
        date: {
          gte: inicioDia,
          lte: finDia,
        },
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        mood: true,
        tags: true,
      },
    });
  }

  async findByKeyword(search: string, userId: string) {
    const cleanSearch = search.trim();

    if (!cleanSearch) {
      return this.findAll(userId);
    }

    const terms = cleanSearch
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !STOP_WORDS.has(t.toLowerCase()));

    if (terms.length === 0) {
      return this.findAll(userId);
    }

    const orConditions: Prisma.EntryWhereInput[] = [];

    for (const term of terms) {
      if (term.startsWith('#')) {
        const tagName = term.replace('#', '').trim();
        if (tagName.length > 0) {
          orConditions.push({
            tags: {
              some: {
                name: { equals: tagName, mode: 'insensitive' },
              },
            },
          });
        }
      } else {
        orConditions.push(
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
          {
            tags: {
              some: {
                name: { contains: term, mode: 'insensitive' },
              },
            },
          },
        );
      }
    }

    return this.prisma.entry.findMany({
      where: {
        userId: userId, 
        OR: orConditions, 
      },
      include: {
        images: true,
        mood: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateEntryDto: CreateEntryDto, userId: string) {
    const { title, content, moodId, date, tags } = updateEntryDto;

    await this.findOne(id, userId);

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


  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.entry.delete({
      where: { id },
    });

    return {
      success: true,
      message: `The journal entry with ID ${id} was removed successfully.`,
    };
  }
}