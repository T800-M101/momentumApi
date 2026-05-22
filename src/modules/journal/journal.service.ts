import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JournalRepository } from './journal.repository';
import { CreateEntryDto } from './dto/create-entry.dto';
import { Prisma } from '@prisma/client';
import { STOP_WORDS } from 'src/constants/stop-words';

@Injectable()
export class JournalService {
  constructor(private readonly journalRepo: JournalRepository) {}

  async create(createEntryDto: CreateEntryDto, userId: string) {
    const { moodId, tags } = createEntryDto;

    const moodExists = await this.journalRepo.checkMoodExists(moodId);
    if (!moodExists) {
      throw new NotFoundException(`El Mood con ID ${moodId} no existe.`);
    }

    const tagsUpdate =
      tags?.map((tagName) => ({
        where: { name: tagName.toLowerCase().trim() },
        create: { name: tagName.toLowerCase().trim() },
      })) || [];

    return this.journalRepo.create(createEntryDto, userId, tagsUpdate);
  }

  async findAll(userId: string) {
    return this.journalRepo.findAll(userId);
  }

  async findOne(id: string, userId: string) {
    const entry = await this.journalRepo.findById(id);

    if (!entry) {
      throw new NotFoundException(
        `The journal entry with ID ${id} does not exist.`,
      );
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this entry.',
      );
    }

    return entry;
  }

  async findByDate(dateString: string, userId: string) {
    const inicioDia = new Date(`${dateString}T00:00:00.000Z`);
    const finDia = new Date(`${dateString}T23:59:59.999Z`);

    return this.journalRepo.findByDateRange(userId, inicioDia, finDia);
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
              some: { name: { equals: tagName, mode: 'insensitive' } },
            },
          });
        }
      } else {
        orConditions.push(
          { title: { contains: term, mode: 'insensitive' } },
          { content: { contains: term, mode: 'insensitive' } },
          {
            tags: {
              some: { name: { contains: term, mode: 'insensitive' } },
            },
          },
        );
      }
    }

    return this.journalRepo.findByConditions(userId, orConditions);
  }

  async update(id: string, updateEntryDto: CreateEntryDto, userId: string) {
    const { moodId, tags } = updateEntryDto;

    const moodExists = await this.journalRepo.checkMoodExists(moodId);
    if (!moodExists) {
      throw new NotFoundException(`The Mood with ID ${moodId} does not exist.`);
    }

    const tagsUpdate =
      tags?.map((tagName) => ({
        where: { name: tagName.toLowerCase().trim() },
        create: { name: tagName.toLowerCase().trim() },
      })) || [];

    try {
      return await this.journalRepo.update(
        id,
        userId,
        updateEntryDto,
        tagsUpdate,
      );
    } catch (error) {
      throw new ForbiddenException(
        'You do not have permission to modify this entry or it does not exist.',
      );
    }
  }

  async remove(id: string, userId: string) {
    try {
      await this.journalRepo.remove(id, userId);
      return {
        success: true,
        message: `The journal entry with ID ${id} was removed successfully.`,
      };
    } catch (error) {
      throw new ForbiddenException(
        'You do not have permission to remove this entry or it does not exist.',
      );
    }
  }

  async getUserStats(userId: string) {
    try {
      const totalEntries = await this.journalRepo.countEntries(userId);
      const currentStreak = await this.journalRepo.getCurrentStreak(userId);

      return {
        totalEntries,
        currentStreak,
      };
    } catch (error) {
      console.error('Failed to compute user statistics:', error);
      return { totalEntries: 0, currentStreak: 0 };
    }
  }
}
