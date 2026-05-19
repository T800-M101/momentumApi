import { Entry, Image } from '@prisma/client';



export class EntryEntity implements Entry {
  id: number;
  title: string;
  mood: string;
  date: string;
  content: string;
  time: string | null;
  createdAt: Date;
  updatedAt: Date;

  // You can add the relation here as well
  images?: Image[];
}
