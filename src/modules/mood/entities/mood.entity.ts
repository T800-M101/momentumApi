import { Entry } from "@prisma/client";

export class Mood {
  id: number;
  label: string;
  emoji: string;

 /**
  * Inverse relationship: A list of all entries
  * associated with this mood.
 */
  entries?: Entry[];

  constructor(partial: Partial<Mood>) {
    Object.assign(this, partial);
  }
}
