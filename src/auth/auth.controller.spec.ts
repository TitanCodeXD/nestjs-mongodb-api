import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';

//Dto
import { LoginDto } from './dto/login.dto';

//Service
import { AuthService } from './auth.service';

//Mocks
const mockAuthService = {
  login: jest.fn(),
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
});
