import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto';

import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    example: 'Desenvolvedor Full Stack',
    description: 'User biography',
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
