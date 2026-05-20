import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  readonly identifier!: string; 

  @IsNotEmpty()
  @IsString()
  readonly password!: string;
}