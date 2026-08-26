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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

//Decorator de rotas Publicas
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //ALL USERS
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all users',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async findAllUsers() {
    return this.usersService.findAllUsers();
  }

  //Retornar o usuario que esta logado
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the authenticated user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async getMe(@Request() req: any) {
    return req.user;
  }

  //Find user by ID
  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to retrieve',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user with the specified ID',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  findUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }

  //CREATE USER
  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //UPDATE USER
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to update',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    return this.usersService.updateUser(id, updateUserDto, req.user);
  }

  //DELETE USER
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.usersService.deleteUser(id, req.user); //req.user é do validate do passport, passport é justamente para autenticação, então ele cria um req.user intenro para uso, é uma convenção do passport
  }
}
