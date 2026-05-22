import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  Put,
  BadRequestException,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/decorators/get-current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUserStats(@CurrentUserId() userId: string) {
    return await this.journalService.getUserStats(userId);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createEntry(
    @Body() createEntryDto: CreateEntryDto,
    @CurrentUserId() userId: string,
  ) {
    return this.journalService.create(createEntryDto, userId);
  }

  @Get()
  async findAll(
    @CurrentUserId() userId: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    if (date) {
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(date)) {
        throw new BadRequestException(
          'The date format must be strictly YYYY-MM-DD',
        );
      }
      console.log('ID', userId);
      return this.journalService.findByDate(date, userId);
    }

    if (search && search.trim() !== '') {
      return this.journalService.findByKeyword(search, userId);
    }

    return this.journalService.findAll(userId);
  }

  @Get(':id')
  async getEntryById(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.journalService.findOne(id, userId);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateEntry(
    @Param('id') id: string,
    @Body() updateEntryDto: CreateEntryDto,
    @CurrentUserId() userId: string,
  ) {
    return this.journalService.update(id, updateEntryDto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.journalService.remove(id, userId);
  }
}
