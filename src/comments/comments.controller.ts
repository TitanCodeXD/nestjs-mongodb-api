import { Controller } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Get, Post, Delete, Patch, Body, Param, Request } from '@nestjs/common';

//Dto
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('')
  async findAllComments() {
    return this.commentsService.findAllComments();
  }

  @Get(':id')
  async findCommentById(@Param('id') id: string) {
    return this.commentsService.findCommentById(id);
  }

  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.updateComment(id, updateCommentDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.deleteComment(id, req.user);
  }
}
