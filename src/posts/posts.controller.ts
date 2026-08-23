import {
  Get,
  Param,
  Patch,
  Delete,
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
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.updatePost(id, updatePostDto, req.user);
  }

  //DELETE Post
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deletePost(id, req.user); //req.user é do validate do passport, passport é justamente para autenticação, então ele cria um req.user intenro para uso, é uma convenção do passport
  }
}
