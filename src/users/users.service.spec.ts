import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

//Errors
import { NotFoundException, ConflictException } from '@nestjs/common';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';

//Dto
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//bcrypt mock
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockBcryptHash = bcrypt.hash as jest.Mock<
    Promise<string>,
    [string, number]
  >;

  const mockUserModel = {
    find: jest.fn(), //Função find 'falsa'
    findById: jest.fn(), //Função find by id 'falsa'
    create: jest.fn(), //Função create 'falsa'
  };

  beforeEach(async () => {
    jest.clearAllMocks(); //A cada teste limpar o 'cache' de mocks
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

  //Apenas no teste do users vou fazer um mapa mental, servira de base de conheicmento para testes nos outros módulos e models existentes no projeto, onde devemos analisar cada cenário importante de cada função
  // findAllUsers() - 1 cenário
  // └── retorna todos os usuários
  //
  // findUserById() - 2 cenários
  // ├── usuário existe → retorna usuário
  // └── usuário não existe → NotFoundException
  //
  // create() - 4 cenários
  // ├── bcrypt → cria hash
  // ├── dados válidos → cria usuário
  // ├── email duplicado → ConflictException
  // └── erro inesperado → propaga erro
  //
  // updateUser() - 4 cenário
  // ├── usuário é dono → atualiza
  // ├── usuário é admin → atualiza
  // ├── usuário não é dono/admin → ForbiddenException
  // └── usuário não existe → NotFoundException
  //
  // deleteUser() - 4 cenários
  // ├── usuário é dono → deleta
  // ├── usuário é admin → deleta
  // ├── usuário não é dono/admin → ForbiddenException
  // └── usuário não existe → NotFoundException

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

  //FindUserById User not Found ERROR
  it('should throw NotFoundException if user is not found', async () => {
    mockUserModel.findById.mockResolvedValue(null);

    await expect(service.findUserById('123')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    expect(mockUserModel.findById).toHaveBeenCalledTimes(1);
  });

  //Create an User - hash password
  it('should create an User', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      password: '123456',
      age: 25,
    };

    //Resultado esperado - usa apenas mocks e função fake
    const hashedPassword = 'hashed-password'; //123456 foi transformado em 'hashed-password'

    //Finja que foi criado uma hash sendo 'hashed-password' e finja que foi criado um usuario onde a senha foi transformada nesse hash falso
    mockBcryptHash.mockResolvedValue(hashedPassword); //Quando o código real pedir para o bcrypt gerar um hash, finja que ele gerou 'hashed-password'

    mockUserModel.create.mockResolvedValue({
      ...createUserDto,
      password: hashedPassword,
    });

    //Resultado obtido - usa a função real
    const result = await service.create(createUserDto); //service e função real mas com dois mocks internos (mongodb - mockUserModel e bcrypt - mockBcryptHash)

    //Hash foi chamado corretamente?
    expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

    //mandou a senha com hash para o mock do mongo?
    expect(mockUserModel.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });

    //Resultado esperado e obtido são iguais?
    expect(result).toEqual({
      ...createUserDto,
      password: hashedPassword,
    });
  });

  //Create an User - email already exists
  it('should throw ConflictException if email already exists', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      password: '123456',
      age: 25,
    };

    const hashedPassword = 'hashed-password'; //123456 foi transformado em 'hashed-password'

    mockBcryptHash.mockResolvedValue('hashed-password');

    //Aqui precisamos dar o contexto antes de testar a função real do service
    mockUserModel.create.mockRejectedValue({
      code: 11000,
      keyPattern: {
        email: 1,
      },
    });

    //A função real deve retornar erro se tentar passar ese createUserDto
    await expect(service.create(createUserDto)).rejects.toThrow(
      ConflictException,
    );

    //é esperado que o mock- mongodb falso chame o create falso passando como argumento o createUserDto
    expect(mockUserModel.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });

    //é esperado que seja chamado so uma vez a função create
    expect(mockUserModel.create).toHaveBeenCalledTimes(1);
  });

  //Create an User - Generical Error
  it('should throw error if generic error', async () => {
    //fornecer todo o contexto apra o ocorrer tal erro
    const createUserDto: CreateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      password: '123456',
      age: 25,
    };

    const hashedPassword = 'hashed-password';

    mockBcryptHash.mockResolvedValue(hashedPassword);

    const unexpectedError = new Error('Database connection failed'); //criando um suposto erro inesperado

    mockUserModel.create.mockRejectedValue(unexpectedError);

    await expect(service.create(createUserDto)).rejects.toThrow(
      unexpectedError,
    );

    //é esperado que o mock- mongodb falso chame o create falso passando como argumento o createUserDto
    expect(mockUserModel.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: hashedPassword,
    });

    //é esperado que seja chamado so uma vez a função create
    expect(mockUserModel.create).toHaveBeenCalledTimes(1);
  });

  //UpdateUser
  it('should update succesfully if you are trying update your own user', async () => {
    //fornecer todo o contexto apra o ocorrer tal erro
    const updateUserDto: UpdateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      age: 25,
    };
  });
});
