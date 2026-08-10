import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

//DTO
import { CreateUserDto } from './dto/create-user.dto';

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
      return await this.userModel.create({
        ...createUserDto,
      });
    } catch (error: any) {
      if (error?.code === 11000 && error?.keyPattern?.email) {
        throw new ConflictException('Email already exists');
      }

      throw error;
    }
  }

  //DELETE USER FUNCTION
  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully!',
    };
  }
}
