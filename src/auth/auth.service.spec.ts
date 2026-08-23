import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

//Errors
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

//Mongoose
import { Types } from 'mongoose';

//Dto
import { LoginDto } from './dto/login.dto';

//Token e userSchema para os mocks
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

//Mocks
const mockAuthModel = {
  findOne: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockbCrypt = {
  compare: jest.fn(),
};

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MjQ2MDgwMDB9.b14bZExyZ812Y1S0vY6I1V0FfP1WqH9n9w34uH9I8c0 token jwt valido para eu copiar e usar nos testes

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockAuthModel, //Mock das funçoes
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
