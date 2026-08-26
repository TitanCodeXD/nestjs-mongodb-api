import {
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsString,
  IsInt,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'Wesley',
    description: 'User name',
    minLength: 2,
    maxLength: 30,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @ApiProperty({
    example: 'wesley@hotmail.com',
    description: 'User email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: '12345',
    description: 'User password',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  password!: string;

  @ApiProperty({
    example: 25,
    description: 'User age',
    minimum: 13,
    maximum: 120,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(13)
  @Max(120)
  age!: number;
}
