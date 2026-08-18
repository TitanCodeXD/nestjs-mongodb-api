import {
  Get,
  Body,
  Controller,
  Post as HttpPost,
  Request,
} from '@nestjs/common';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //GetAllPosts
  @Get()
  findAllPosts() {
    return this.postsService.findAllPosts();
  }

  //CreatePost
  @HttpPost()
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.createPost(createPostDto, req.user);
  }
}
