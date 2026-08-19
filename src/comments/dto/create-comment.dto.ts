import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @IsNotEmpty()
  @IsString()
  post!: string;
}
