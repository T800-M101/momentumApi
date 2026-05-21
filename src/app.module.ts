import { Module } from '@nestjs/common';
import { JournalModule } from './modules/journal/journal.module';
import { MoodModule } from './modules/mood/mood.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    JournalModule, 
    MoodModule, 
    AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
