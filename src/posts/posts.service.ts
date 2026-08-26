import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

//Errors
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { Types } from 'mongoose';

//Schema
import { Post } from './schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

//Userschema para referenciar o author dos posts
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,

    @InjectModel(Comment.name)
    private readonly commentModel: Model<Post>,
  ) {}

  //Get All Posts Fucntion
  async findAllPosts() {
    return this.postModel.find().populate('author', 'name');
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

  //Create Post Function
  async createPost(createPostDto: CreatePostDto, user: User) {
    return this.postModel.create({
      ...createPostDto,
      author: user._id,
    });
  }

  //Update Post Function
  async updatePost(id: string, updatePostDto: UpdatePostDto, user: User) {
    //Id do post é um objectId valido do mongodb?
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID');
    }

    //Achar o post
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    //Verificação se o que voce quer dar update te pertence ou não
    const isOwner = user._id.toString() === post.author.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own post');
    }

    await this.postModel.findByIdAndUpdate(id, updatePostDto, {
      returnDocument: 'after',
    });

    return {
      message: 'Post updated successfully!',
    };
  }

  //Delete Postr Function
  async deletePost(id: string, user: User) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post ID');
    }

    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    //Verificação se o que voce quer dar update te pertence ou não
    const isOwner = user._id.toString() === post.author.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own post');
    }

    await this.commentModel.deleteMany({
      post: post._id,
    });

    await this.postModel.findByIdAndDelete(id);

    return {
      message: 'Post deleted successfully!',
    };
  }
}
