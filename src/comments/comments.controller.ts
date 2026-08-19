import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Post, Body, Param, Request } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('posts')
export class CommentsController {
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
}
