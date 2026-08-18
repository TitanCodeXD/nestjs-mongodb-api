import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

//DTO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//Bcrypt
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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

      return await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  //DELETE USER FUNCTION
  async deleteUser(id: string, user: any) {
    const isOwner = user._id.toString() === id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own account');
    }

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

  //UPDATE USER FUNCTION
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      returnDocument: 'before',
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User updated successfully!',
    };
  }
}
