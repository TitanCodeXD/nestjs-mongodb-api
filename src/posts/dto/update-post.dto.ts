import { PartialType } from '@nestjs/mapped-types'; //os campos ficam opcionais, mas as regras dos campos continuam existindo..
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
