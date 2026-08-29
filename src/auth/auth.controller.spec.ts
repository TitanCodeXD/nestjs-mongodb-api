import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

//Dto
import { LoginDto } from './dto/login.dto';

//Service
import { AuthService } from './auth.service';

//Mocks
const mockAuthService = {
  login: jest.fn(),
  verifyEmail: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be authenticated', async () => {
    const loginDto: LoginDto = {
      email: 'wesley@hotmail.com',
      password: '123',
    };

    mockAuthService.login.mockResolvedValue(loginDto);

    const result = await controller.login(loginDto);

    expect(result).toEqual(loginDto);
    expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    expect(mockAuthService.login).toHaveBeenCalledTimes(1);
  });

  it('should be validated', async () => {
    const user = {
      _id: '75e53cc8-e240-4386-9f61-0b4b6cced34e',
      name: 'Wesley',
      email: 'wesleysantos32892653@gmail.com',
      age: 21,
      role: 'user',
      emailVerified: true,
    };

    const token = {
      emailVerificationToken: '4ba8fc0e-544e-4b8a-84ec-57fc536e0b0e',
    };

    mockAuthService.verifyEmail.mockResolvedValue(user);

    const result = await controller.verifyEmail(token.emailVerificationToken);

    expect(result).toEqual(user);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(
      token.emailVerificationToken,
    );
    expect(mockAuthService.verifyEmail).toHaveBeenCalledTimes(1);
  });
});
