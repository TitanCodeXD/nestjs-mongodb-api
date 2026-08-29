import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';

//Uuid
import { randomUUID } from 'crypto';

//DTO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//Queue
import { QueueService } from 'src/queue/queue.service';

//Bcrypt
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,

    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,

    private readonly queueService: QueueService,
  ) {}

  //ALL USERS FUNCTION
  async findAllUsers() {
    return this.userModel.find();
  }

  //Find User by ID Function
  async findUserById(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // CREATE USER FUNCTION
  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const emailVerificationToken = randomUUID();

      const createdUser = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
        emailVerificationToken: emailVerificationToken,
      });

      await this.queueService.addVerificationEmailJob(
        createdUser.email,
        createdUser._id,
        createdUser.emailVerificationToken!,
      );

      return createdUser;
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  //UPDATE USER FUNCTION
  async updateUser(id: string, updateUserDto: UpdateUserDto, user: User) {
    //Verificação inicial se o que voce quer dar update te pertence ou não
    const isOwner = user._id.toString() === id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only update your own account');
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      {
        returnDocument: 'after',
      },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User updated successfully!',
    };
  }

  //DELETE USER FUNCTION
  async deleteUser(id: string, user: any) {
    //Verificação inicial se o que voce quer deletar te pertence ou não
    const isOwner = user._id.toString() === id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }

    //Commnts do user
    await this.commentModel.deleteMany({
      author: user._id,
    });

    //Posts que o user criou -> comentarios relacionados
    const posts = await this.postModel.find({ author: user._id }).select('_id');

    const postIds = posts.map((post) => post._id);

    await this.commentModel.deleteMany({
      post: { $in: postIds },
    });

    //Posts do user
    await this.postModel.deleteMany({
      author: user._id,
    });

    const deletedUser = await this.userModel.findOneAndDelete({
      _id: id,
    });

    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
    };
  }
}
