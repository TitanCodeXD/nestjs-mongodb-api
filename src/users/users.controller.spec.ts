//Mock do QueueService para evitar carregar o BullMQ real durante os testes unitários.
//O UsersService só precisa simular o comportamento do QueueService, não testar o BullMQ aqui.
jest.mock('../queue/queue.service', () => ({
  QueueService: jest.fn(),
}));
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

//Service
import { UsersService } from './users.service';

//Dto
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//Mocks
const mockUsersService = {
  findAllUsers: jest.fn(),
  findUserById: jest.fn(),
  create: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const users = [
      {
        _id: '123',
        name: 'Wesley',
        email: 'wesley@hotmail.com',
      },
      {
        _id: '456',
        name: 'João',
        email: 'joao@hotmail.com',
      },
    ];

    mockUsersService.findAllUsers.mockResolvedValue(users);

    const result = await controller.findAllUsers();

    expect(result).toEqual(users);

    expect(mockUsersService.findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should return the authenticated user', async () => {
    const user = {
      _id: '123',
      email: 'wesley@hotmail.com',
      role: 'user',
    };

    const req = {
      user,
    };

    const result = await controller.getMe(req);

    expect(result).toEqual(user);
  });

  it('should return an user by id', async () => {
    const user = {
      _id: '123',
      email: 'wesley@hotmail.com',
      role: 'user',
    };

    const id = '123';

    mockUsersService.findUserById.mockResolvedValue(user);

    const result = await controller.findUserById(id);

    expect(result).toEqual(user);

    expect(mockUsersService.findUserById).toHaveBeenCalledWith(id);

    expect(mockUsersService.findUserById).toHaveBeenCalledTimes(1);
  });

  it('should create an user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'wesley',
      email: 'wesley@hotmail.com',
      password: '12345',
      age: 25,
    };

    mockUsersService.create.mockResolvedValue(createUserDto);

    const result = await controller.create(createUserDto);

    expect(result).toEqual(createUserDto);

    expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);

    expect(mockUsersService.create).toHaveBeenCalledTimes(1);
  });

  it('should update an user', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'wesley',
      email: 'wesley@hotmail.com',
      age: 25,
    };

    const user = {
      _id: '123',
      email: 'wesley@hotmail.com',
      role: 'user',
    };

    const req = {
      user,
    };

    const id = '123';

    mockUsersService.updateUser.mockResolvedValue(updateUserDto);

    const result = await controller.updateUser(id, updateUserDto, req);

    expect(result).toEqual(updateUserDto);

    expect(mockUsersService.updateUser).toHaveBeenCalledWith(
      id,
      updateUserDto,
      req.user,
    );

    expect(mockUsersService.updateUser).toHaveBeenCalledTimes(1);
  });

  it('should delete an user', async () => {
    const id = '123';

    const user = {
      _id: '123',
      email: 'wesley@hotmail.com',
      role: 'user',
    };

    const req = {
      user,
    };

    mockUsersService.deleteUser.mockResolvedValue(id);

    const result = await controller.remove(id, req);

    expect(result).toEqual(id);

    expect(mockUsersService.deleteUser).toHaveBeenCalledWith(id, req.user);

    expect(mockUsersService.deleteUser).toHaveBeenCalledTimes(1);
  });
});
