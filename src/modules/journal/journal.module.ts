import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { PrismaService } from 'src/prisma/prisma-service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JournalRepository } from './journal.repository';

@Module({
  imports: [
    PrismaModule,
    AuthModule
  ],
  controllers: [JournalController],
  providers: [PrismaService, JournalService, JournalRepository],
})
export class JournalModule {}
