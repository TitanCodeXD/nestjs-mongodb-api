import { PartialType } from '@nestjs/mapped-types'; //os campos ficam opcionais, mas as regras dos campos continuam existindo..
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  bio?: string;
}
