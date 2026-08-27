import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Get, Post, Delete, Patch, Body, Param, Request } from '@nestjs/common';

//Swagger
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

//Dto
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'List all Comments' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all comments',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Get('')
  async findAllComments() {
    return this.commentsService.findAllComments();
  }

  @ApiOperation({ summary: 'Get a Comment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the comment to retrieve',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a comment',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Get(':id')
  async findCommentById(@Param('id') id: string) {
    return this.commentsService.findCommentById(id);
  }

  @ApiOperation({ summary: 'Update a Comment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the comment to update',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - user is not the owner of the comment and is not an admin',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, req.user);
  }

  @ApiOperation({ summary: 'Delete a Comment' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the comment to delete',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - user is not the owner of the comment and is not an admin',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.deleteComment(id, req.user);
  }
}
