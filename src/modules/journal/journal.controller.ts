import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateEntryDto } from './dto/create-entry.dto';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createEntry(@Body() createEntryDto: CreateEntryDto) {
    return this.journalService.create(createEntryDto);
  }

  @Get()
  findAll() {
    return this.journalService.findAll();
  }

  @Get(':id')
  async getEntryById(@Param('id', ParseIntPipe) id: number) {
    return this.journalService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateEntry(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEntryDto: CreateEntryDto,
  ) {
    return this.journalService.update(id, updateEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journalService.remove(+id);
  }
}
