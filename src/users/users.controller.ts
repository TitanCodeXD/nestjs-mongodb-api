import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

//DTO
import { CreateUserDto } from './dto/create-user.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //ALL USERS
  @Get()
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  //CREATE USER
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
