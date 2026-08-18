import {
  Get,
  Param,
  Patch,
  Body,
  Controller,
  Post as HttpPost,
  Request,
} from '@nestjs/common';

//Service
import { PostsService } from './posts.service';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //GetAllPosts
  @Get()
  findAllPosts() {
    return this.postsService.findAllPosts();
  }

  //GetPostById
  @Get(':id') findPostById(@Param('id') id: string) {
    return this.postsService.findPostById(id);
  }

  //CreatePost
  @HttpPost()
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.createPost(createPostDto, req.user);
  }

  //UpdatePost
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.updatePost(id, updatePostDto, req.user);
  }
}
