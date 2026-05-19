import { Entry, Image, Tag } from '@prisma/client';



export class EntryEntity implements Entry {
  id: number;
  title: string;
  mood: string;
  emoji: string;
  date: Date;
  moodId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  images: Image[];
}
