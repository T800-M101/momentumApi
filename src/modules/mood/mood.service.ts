import { Injectable } from '@nestjs/common';
import { MoodRepository } from './mood.repository';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';

@Injectable()
export class MoodService {
  
  constructor(private readonly moodRepo: MoodRepository) {}

  create(createMoodDto: CreateMoodDto) {
    return 'This action adds a new mood';
  }

  async findAll() {
    return this.moodRepo.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} mood`;
  }

  update(id: number, updateMoodDto: UpdateMoodDto) {
    return `This action updates a #${id} mood`;
  }

  remove(id: number) {
    return `This action removes a #${id} mood`;
  }
}