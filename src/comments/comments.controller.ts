import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Get, Post, Body, Param, Request } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  async findCommentById(@Param('id') id: string) {
    return this.commentsService.findCommentById(id);
  }
}
