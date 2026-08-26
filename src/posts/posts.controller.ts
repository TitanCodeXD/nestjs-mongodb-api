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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //GetAllPosts
  @ApiOperation({ summary: 'List all Posts' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all posts',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Get()
  findAllPosts() {
    return this.postsService.findAllPosts();
  }

  //GetPostById
  @ApiOperation({ summary: 'Get a Post' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the post to retrieve',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a post',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Get(':id')
  findPostById(@Param('id') id: string) {
    return this.postsService.findPostById(id);
  }

  //CreatePost
  @ApiOperation({ summary: 'Create a new Post' })
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @HttpPost()
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.postsService.createPost(createPostDto, req.user);
  }

  //UpdatePost
  @ApiOperation({ summary: 'Update a Post' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the post to update',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: 'Post successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - user is not the owner of the post and is not an admin',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Patch(':id')
  updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    return this.postsService.updatePost(id, updatePostDto, req.user);
  }

  //DELETE Post
  @ApiOperation({ summary: 'Delete a Post' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the post to delete',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Post successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - user is not the owner of the post and is not an admin',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.postsService.deletePost(id, req.user); //req.user é do validate do passport, passport é justamente para autenticação, então ele cria um req.user intenro para uso, é uma convenção do passport
  }
}
