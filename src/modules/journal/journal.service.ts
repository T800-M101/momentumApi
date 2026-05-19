import { Injectable } from '@nestjs/common';
import { CreateJournalDto } from './dto/create-journal.dto';
import { UpdateJournalDto } from './dto/update-journal.dto';
import { PrismaService } from 'src/prisma/prisma-service';

@Injectable()
export class JournalService {

  
  constructor(private prisma: PrismaService) {}


  create(createJournalDto: CreateJournalDto) {
    return 'This action adds a new journal';
  }

  async findAll() {
    return this.prisma.entry.findMany({
      include: {
        images: true,
        tags:true,
        mood: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} journal`;
  }

  update(id: number, updateJournalDto: UpdateJournalDto) {
    return `This action updates a #${id} journal`;
  }

  remove(id: number) {
    return `This action removes a #${id} journal`;
  }
}
