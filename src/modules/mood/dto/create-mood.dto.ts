import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMoodDto {
  @IsString()
  @IsNotEmpty()
  label!: string; 

  @IsString()
  @IsNotEmpty()
  emoji!: string; 
}