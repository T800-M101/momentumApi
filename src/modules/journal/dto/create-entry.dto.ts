import { IsString, IsNumber, IsArray, IsOptional, IsDateString, MinLength } from 'class-validator';

export class CreateEntryDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  moodId: number;

  @IsDateString()
  date: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
