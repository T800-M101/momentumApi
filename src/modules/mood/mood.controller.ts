import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MoodService } from './mood.service';


import { CreateMoodDto } from './dto/create-mood.dto';
import { ApiCreateMood, ApiFindAllMoods, ApiGetMoodById, ApiRemoveMood, ApiUpdateMood } from './decorators/api-mood.decorators';
import { UpdateMoodDto } from './dto/update-mood.dto';

@ApiTags('Moods') // Groups these operations nicely inside the Swagger UI panel
@Controller('mood')
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post()
  @ApiCreateMood()
  create(@Body() createMoodDto: CreateMoodDto) {
    return this.moodService.create(createMoodDto);
  }

  @Get()
  @ApiFindAllMoods()
  findAll() {
    return this.moodService.findAll();
  }

  @Get(':id')
  @ApiGetMoodById()
  findOne(@Param('id') id: string) {
    return this.moodService.findOne(+id); // Explicit numerical conversion unary operator intact
  }

  @Patch(':id')
  @ApiUpdateMood()
  update(@Param('id') id: string, @Body() updateMoodDto: UpdateMoodDto) {
    return this.moodService.update(+id, updateMoodDto);
  }

  @Delete(':id')
  @ApiRemoveMood()
  remove(@Param('id') id: string) {
    return this.moodService.remove(+id);
  }
}