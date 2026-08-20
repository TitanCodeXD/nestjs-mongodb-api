import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

//Errors
import { NotFoundException } from '@nestjs/common';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    find: jest.fn(), //Função find 'falsa'
    findById: jest.fn(), //Função find by id 'falsa'
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name), //Pegar o token do userModel para conseguirmos 'simular'/mock
          useValue: mockUserModel, //Mock das funçoes
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  //Testes
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //FindAllUsers
  it('should find all users', async () => {
    const users = [{ name: 'Wesley' }, { name: 'João' }];

    mockUserModel.find.mockResolvedValue(users); //Dando um find falso (vulgo jest.fn()) no userModel falso (vulgo modkUserModel) é esperado que o mock retorno users que escrevemos acima, é o RESULTADO esperado, ja que criamos esse users.

    const result = await service.findAllUsers(); //Se ali em ciam era o resultado ESPERADO, agora vamos ver o resultado OBTIDO, para depois comparar se são iguais, aí sim passa no teste;

    expect(result).toEqual(users); //Iguais?
    expect(mockUserModel.find).toHaveBeenCalledTimes(1);
  });

  //FindUserById
  it('should find a user by id', async () => {
    const user = {
      _id: '123',
      name: 'Wesley',
    };

    mockUserModel.findById.mockResolvedValue(user);

    const result = await service.findUserById('123');

    expect(result).toEqual(user);
    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(mockUserModel.findById).toHaveBeenCalledTimes(1);
  });

  //FindUserById ERROR
  it('should throw NotFoundException if user is not found', async () => {
    mockUserModel.findById.mockResolvedValue(null);

    await expect(service.findUserById('123')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(mockUserModel.findById).toHaveBeenCalledTimes(1);
  });
});
