import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma-service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { STOP_WORDS } from 'src/constants/stop-words';
import { Prisma } from '@prisma/client';

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

  // It brings the last 30 unfiltered entries for the initial app load.
  async findAll() {
    return this.prisma.entry.findMany({
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

  async findOne(id: string) {
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

  async findByDate(dateString: string) {
    // Ex: dateString = '2026-05-20'
    const inicioDia = new Date(`${dateString}T00:00:00.000Z`);
    const finDia = new Date(`${dateString}T23:59:59.999Z`);

    return await this.prisma.entry.findMany({
      where: {
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

/**
   * Fetches journal entries matching dynamic free-text keywords or hashtags.
   * Parses multi-term search strings and sanitizes query tokens against stop words.
   * * @param search Raw search string from the frontend input (e.g., "#happy-coding, chipinque")
   */
  async findByKeyword(search: string) {
    const cleanSearch = search.trim();
    
    // Fall back to default home feed if query is entirely empty spaces
    if (!cleanSearch) {
      return this.findAll();
    }

    // 🚀 STEP 1: Tokenize the search string by splitting on spaces (\s) or commas (,)
    // This perfectly splits strings like "#happy-coding, chipinque" into individual tokens
    const terms = cleanSearch
      .split(/[\s,]+/) 
      .map(t => t.trim())
      .filter(t => t.length > 0 && !STOP_WORDS.has(t.toLowerCase()));

    // Edge case safety: If no valid terms remain after removing stop words, abort heavy scanning
    if (terms.length === 0) {
      return this.findAll();
    }

    // 🚀 STEP 2: Explicitly type the array using Prisma's structural type to resolve ts(2345)
    const orConditions: Prisma.EntryWhereInput[] = [];

    // Loop through each isolated word token to construct atomic criteria
    for (const term of terms) {
      if (term.startsWith('#')) {
        // Handle explicit hashtag lookups (exact match on the relation table schema)
        const tagName = term.replace('#', '').trim();
        if (tagName.length > 0) {
          orConditions.push({
            tags: {
              some: {
                name: { equals: tagName, mode: 'insensitive' }
              }
            }
          });
        }
      } else {
        // Handle free-text lookups (broad partial scans across Title, Body, or Tag text fields)
        orConditions.push(
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
          {
            tags: {
              some: {
                name: { contains: term, mode: 'insensitive' }
              }
            }
          }
        );
      }
    }

    // Execute the dynamically assembled query against Postgres via Prisma engine
    return this.prisma.entry.findMany({
      where: {
        OR: orConditions
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

  async update(id: string, updateEntryDto: CreateEntryDto) {
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

  async remove(id: string) {
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
