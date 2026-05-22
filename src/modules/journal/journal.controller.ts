import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  BadRequestException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/decorators/get-current-user.decorator';
import { ApiCreateEntry, ApiFindAllEntries, ApiGetEntryById, ApiGetStats, ApiRemoveEntry, ApiUpdateEntry } from './decorators/api-journal.decorators';




@ApiTags('Journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('stats')
  @ApiGetStats() 
  async getUserStats(@CurrentUserId() userId: string) {
    return await this.journalService.getUserStats(userId);
  }

  @Post()
  @ApiCreateEntry() 
  async createEntry(
    @Body() createEntryDto: CreateEntryDto,
    @CurrentUserId() userId: string,
  ) {
    return this.journalService.create(createEntryDto, userId);
  }

  @Get()
  @ApiFindAllEntries() 
  async findAll(
    @CurrentUserId() userId: string,
    @Query('date') date?: string,
    @Query('search') search?: string,
  ) {
    if (date) {
      const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
      if (!regexFecha.test(date)) {
        throw new BadRequestException('The date format must be strictly YYYY-MM-DD');
      }
      return this.journalService.findByDate(date, userId);
    }

    if (search && search.trim() !== '') {
      return this.journalService.findByKeyword(search, userId);
    }

    return this.journalService.findAll(userId);
  }

  @Get(':id')
  @ApiGetEntryById()
  async getEntryById(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.journalService.findOne(id, userId);
  }

  @Put(':id')
  @ApiUpdateEntry()
  async updateEntry(
    @Param('id') id: string,
    @Body() updateEntryDto: CreateEntryDto,
    @CurrentUserId() userId: string,
  ) {
    return this.journalService.update(id, updateEntryDto, userId);
  }

  @Delete(':id')
  @ApiRemoveEntry()
  async remove(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.journalService.remove(id, userId);
  }
}