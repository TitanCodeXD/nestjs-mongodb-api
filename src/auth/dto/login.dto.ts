import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    default: 'wesleysantos32892653@gmail.com',
    example: 'wesleysantos32892653@gmail.com',
    description: 'User email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    default: '12345',
    example: '12345',
    description: 'User password',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
