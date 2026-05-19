import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalModule } from './modules/journal/journal.module';

@Module({
  imports: [JournalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
