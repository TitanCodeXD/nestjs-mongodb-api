import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class PostCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.createComment(
      postId,
      createCommentDto,
      req.user,
    );
  }

  @Get(':postId/comments')
  async findPostComments(@Param('postId') postId: string) {
    return this.commentsService.findPostComments(postId);
  }
}
