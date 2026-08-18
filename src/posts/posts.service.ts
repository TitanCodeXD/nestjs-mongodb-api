import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

//Errors
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { Types } from 'mongoose';

//Schema
import { Post } from './schemas/post.schema';

//Dto
import { CreatePostDto } from './dto/create-post.dto';

//Userschema para referenciar o author dos posts
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
  ) {}

  //Get All Posts Fucntion
  async findAllPosts() {
    return this.postModel.find().populate('author', 'name');
  }

  //Create Post Function
  async createPost(createPostDto: CreatePostDto, user: User) {
    return this.postModel.create({
      ...createPostDto,
      author: user._id,
    });
  }

  //Get post by Id Functiob
  async findPostById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID');
    }
    const post = await this.postModel.findById(id).populate('author', 'name');

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }
}
