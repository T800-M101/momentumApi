import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    example: 'guillermo.moran@example.com', 
    description: 'The user email' 
  })
  @IsEmail({}, { message: 'The email format is invalid' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Access password (minimum 6 characters)',
    minLength: 6 
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({ 
    example: 'Guillermo Moran', 
    description: 'User full name' 
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  //Prevents usernames from containing '@', ensuring they can never be confused with an email
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  readonly username!: string;
}