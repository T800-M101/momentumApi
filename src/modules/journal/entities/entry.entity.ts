import { Entry, Image, Tag } from '@prisma/client';



export class EntryEntity implements Entry {
  id: string;
  title: string;
  mood: string;
  emoji: string;
  date: Date;
  moodId: number;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  images: Image[];
}
