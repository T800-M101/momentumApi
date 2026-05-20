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
  BadRequestException,
  Query,
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
  async findAll(@Query('date') date?: string, @Query('search') search?: string) {
    if (date) {
      // We quickly validate that the format is a valid YYYY-MM-DD string before hitting the database
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(date)) {
        throw new BadRequestException('El formato de fecha debe ser estrictamente YYYY-MM-DD');
      }

      return this.journalService.findByDate(date);
    }

    if (search && search.trim() !== '') {
      return this.journalService.findByKeyword(search);
    }

    // If the query param '?date=' is not present, respond with the default logic (30 entries)
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
