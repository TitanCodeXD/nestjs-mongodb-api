import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
export class CreateCommentDto {
  @ApiProperty({
    example: 'Comment',
    description: 'Post Comment',
    minLength: 1,
    maxLength: 5000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}
