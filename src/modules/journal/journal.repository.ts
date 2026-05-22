import { Injectable } from '@nestjs/common';
import { CreateEntryDto } from './dto/create-entry.dto'; // Ajusta la ruta si es diferente
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma-service';

@Injectable()
export class JournalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async checkMoodExists(moodId: number) {
    return this.prisma.mood.findUnique({
      where: { id: moodId },
    });
  }

  async create(createEntryDto: CreateEntryDto, userId: string, tagsUpdate: any[]) {
    const { title, content, moodId, date } = createEntryDto;
    return this.prisma.entry.create({
      data: {
        title,
        content,
        date: new Date(date),
        userId,
        moodId,
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
      where: { userId },
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

  async findById(id: string) {
    return this.prisma.entry.findUnique({
      where: { id },
      include: {
        mood: true,
        tags: true,
      },
    });
  }

  async findByDateRange(userId: string, inicioDia: Date, finDia: Date) {
    return this.prisma.entry.findMany({
      where: {
        userId,
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

  async findByConditions(userId: string, orConditions: Prisma.EntryWhereInput[]) {
    return this.prisma.entry.findMany({
      where: {
        userId,
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

  async update(id: string, userId: string, updateEntryDto: CreateEntryDto, tagsUpdate: any[]) {
    const { title, content, moodId, date } = updateEntryDto;
    return this.prisma.entry.update({
      where: { id, userId },
      data: {
        title,
        content,
        date: new Date(date),
        mood: { connect: { id: moodId } },
        tags: {
          set: [],
          connectOrCreate: tagsUpdate,
        },
      },
      include: { mood: true, tags: true },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.entry.delete({
      where: { id, userId },
    });
  }

  async countEntries(userId: string): Promise<number> {
    return this.prisma.entry.count({
      where: { userId },
    });
  }

  async getCurrentStreak(userId: string): Promise<number> {
    const streakResult = await this.prisma.$queryRawUnsafe<any[]>(`
      WITH unique_dates AS (
        SELECT DISTINCT (substring("date"::text from 1 for 10))::date AS entry_date
        FROM "Entry"
        WHERE "userId" = $1
      ),
      ordered_dates AS (
        SELECT entry_date,
               entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date ASC) * INTERVAL '1 day') AS group_id
        FROM unique_dates
      ),
      streak_groups AS (
        SELECT COUNT(*) AS streak_length,
               MAX(entry_date) AS end_date
        FROM ordered_dates
        GROUP BY group_id
      )
      SELECT streak_length
      FROM streak_groups
      WHERE end_date >= (NOW() AT TIME ZONE 'America/Monterrey')::date - INTERVAL '1 day'
      ORDER BY streak_length DESC
      LIMIT 1;
    `, userId);

    return streakResult.length > 0 ? Number(streakResult[0].streak_length) : 0;
  }
}