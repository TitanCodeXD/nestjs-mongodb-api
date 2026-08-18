import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';

//DTO
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//JWT Guard
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

//Swagger
import { ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

//Decorator de rotas Publicas
import { Public } from '../auth/decorators/public.decorator';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //ALL USERS
  @Get()
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  //Retornar o usuario que esta logado
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user',
  })
  @Get('me')
  async getMe(@Request() req: any) {
    return req.user;
  }

  //Find user by ID
  @Get(':id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  //CREATE USER
  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //UPDATE USER
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  //DELETE USER
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteUser(id, req.user); //req.user é do validate do passport, passport é justamente para autenticação, então ele cria um req.user intenro para uso, é uma convenção do passport
  }
}
