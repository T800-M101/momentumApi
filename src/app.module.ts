import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalModule } from './modules/journal/journal.module';
import { MoodModule } from './modules/mood/mood.module';

@Module({
  imports: [JournalModule, MoodModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
