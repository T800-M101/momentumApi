import { Module } from '@nestjs/common';
import { MoodService } from './mood.service';
import { MoodController } from './mood.controller';
import { PrismaService } from 'src/prisma/prisma-service';
import { MoodRepository } from './mood.repository';

@Module({
  controllers: [MoodController],
  providers: [MoodService, PrismaService, MoodRepository],
})
export class MoodModule {}
