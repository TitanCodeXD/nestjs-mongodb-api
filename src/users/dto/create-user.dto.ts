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

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  password!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(13)
  @Max(120)
  age!: number;
}
