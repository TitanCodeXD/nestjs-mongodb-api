import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

//Errors
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

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
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

jest.mock('bcrypt');

const mockBcryptCompare = bcrypt.compare as jest.Mock<
  Promise<boolean>,
  [string, string]
>;

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

  it('should return UnauthorizedException if invalid credentials', async () => {
    const loginDto: LoginDto = {
      email: 'wesley@hotmail.com',
      password: '12345',
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(null),
    };

    mockAuthModel.findOne.mockReturnValue(mockQuery);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockAuthModel.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
    });

    expect(mockQuery.select).toHaveBeenCalledWith('+password');

    expect(mockBcryptCompare).not.toHaveBeenCalled();
  });

  it('should return UnauthorizedException if invalid credentials (password)', async () => {
    const loginDto: LoginDto = {
      email: 'wesley@hotmail.com',
      password: '12345',
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(loginDto),
    };

    mockAuthModel.findOne.mockReturnValue(mockQuery);

    mockBcryptCompare.mockResolvedValue(false);

    await expect(service.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockAuthModel.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
    });

    expect(mockQuery.select).toHaveBeenCalledWith('+password');
  });

  it('should login succesfully', async () => {
    const loginDto: LoginDto = {
      email: 'wesley@hotmail.com',
      password: '12345',
    };

    const user = {
      _id: '6a84e6cb20b4580b66612fc9',
      role: 'user',
      password: '12345',
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(user),
    };

    mockAuthModel.findOne.mockReturnValue(mockQuery);

    mockBcryptCompare.mockResolvedValue(true);

    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjI1MjQ2MDgwMDB9.b14bZExyZ812Y1S0vY6I1V0FfP1WqH9n9w34uH9I8c0';

    mockJwtService.sign.mockReturnValue(accessToken);

    const result = await service.login(loginDto);

    expect(result).toEqual({
      message: 'Login successfull',
      access_token: accessToken,
      id: user._id,
    });

    expect(mockAuthModel.findOne).toHaveBeenCalledWith({
      email: loginDto.email,
    });

    expect(mockQuery.select).toHaveBeenCalledWith('+password');

    expect(mockBcryptCompare).toHaveBeenCalledWith(
      loginDto.password,
      user.password,
    );

    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: user._id,
      role: user.role,
    });
  });

  it('should return NotFoundException when trying validate email token', async () => {
    const token = {
      emailVerificationToken: '4ba8fc0e-544e-4b8a-84ec-57fc536e0b0e',
    };

    mockAuthModel.findOne.mockResolvedValue(null);

    await expect(
      service.verifyEmail(token.emailVerificationToken),
    ).rejects.toThrow(NotFoundException);

    expect(mockAuthModel.findOne).toHaveBeenCalledWith({
      emailVerificationToken: token.emailVerificationToken,
    });

    expect(mockAuthModel.findOne).toHaveBeenCalledTimes(1);
  });

  it('should verify the user email successfully', async () => {
    const token = '4ba8fc0e-544e-4b8a-84ec-57fc536e0b0e';

    const user = {
      _id: '75e53cc8-e240-4386-9f61-0b4b6cced34e',
      name: 'Wesley',
      email: 'wesleysantos32892653@gmail.com',
      age: 21,
      role: 'user',
      emailVerified: false,
      emailVerificationToken: token,
      save: jest.fn(),
    };

    mockAuthModel.findOne.mockResolvedValue(user);

    const result = await service.verifyEmail(token);

    expect(mockAuthModel.findOne).toHaveBeenCalledWith({
      emailVerificationToken: token,
    });

    expect(user.emailVerified).toBe(true);
    expect(user.emailVerificationToken).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(user);
  });
});
