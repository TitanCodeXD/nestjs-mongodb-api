import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
  })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
