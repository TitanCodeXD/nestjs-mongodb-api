import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

//Swagger
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Post Comments')
@Controller('posts')
export class PostCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Create a new Post Comment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to comment',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
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

  @ApiOperation({ summary: 'Get comments of a post' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'postId',
    description: 'The ID of the post to retrieve comments',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'List all of the comments of the post',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Get(':postId/comments')
  async findPostComments(@Param('postId') postId: string) {
    return this.commentsService.findPostComments(postId);
  }
}
