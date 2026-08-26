import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

//Errors
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

//Token and userSchema
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Post } from '../posts/schemas/post.schema';
import { Comment } from '../comments/schemas/comment.schema';

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
    findByIdAndUpdate: jest.fn(), //Função de update 'falsa'
    findOneAndDelete: jest.fn(), //Função de delete 'falsa'
  };

  const mockPostModel = {
    find: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockCommentModel = {
    find: jest.fn(),
    deleteMany: jest.fn(),
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
        {
          provide: getModelToken(Post.name), //Pegar o token do userModel para conseguirmos 'simular'/mock
          useValue: mockPostModel, //Mock das funçoes
        },
        {
          provide: getModelToken(Comment.name), //Pegar o token do userModel para conseguirmos 'simular'/mock
          useValue: mockCommentModel, //Mock das funçoes
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

    mockUserModel.findById.mockResolvedValue(user); //esperado

    const result = await service.findUserById('123'); //obtido

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

  //UpdateUser - Owner
  it('should update succesfully if you are trying update your own user', async () => {
    //fornecer todo o contexto apra o ocorrer tal erro
    const updateUserDto: UpdateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      bio: 'minha primeira bio!',
      age: 25,
    };

    //Usuario
    const userId = '1';

    //Usuario logado
    const user = {
      _id: userId,
      role: 'user',
    };

    mockUserModel.findByIdAndUpdate.mockResolvedValue({
      ...updateUserDto,
      _id: userId,
    });

    const result = await service.updateUser(
      userId,
      updateUserDto,
      user as User,
    );

    //Foi chamado para atualizar?
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      updateUserDto,
      {
        returnDocument: 'after',
      },
    );

    expect(result).toEqual({
      message: 'User updated successfully!',
    });

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  //UpdateUser - Admin
  it('should update succesfully if you are trying update an user beeing Admin', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      bio: 'minha primeira bio!',
      age: 25,
    };

    //Usuario
    const userId = '1';

    //Usuario logado
    const user = {
      _id: '2',
      role: 'admin',
    };

    mockUserModel.findByIdAndUpdate.mockResolvedValue({
      _id: userId,
      ...updateUserDto,
    });

    const result = await service.updateUser(
      userId,
      updateUserDto,
      user as User,
    );

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      updateUserDto,
      {
        returnDocument: 'after',
      },
    );

    expect(result).toEqual({
      message: 'User updated successfully!',
    });

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  //Update an User - ForbiddenException Error
  it('should return ForbiddenException if user is not an admin and not the owner of the account', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      bio: 'minha primeira bio!',
      age: 25,
    };

    //Usuario
    const userId = '1';

    //Usuario logado
    const user = {
      _id: '2',
      role: 'user',
    };

    //esperado que de erro por nao ser admin nem o mesmo id de user
    await expect(
      service.updateUser(userId, updateUserDto, user as User),
    ).rejects.toThrow(ForbiddenException);

    // garantir quem o mongo nem chamado foi
    expect(mockUserModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  //Update an User - User not found
  it('should return NotFoundException', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Wesley',
      email: 'wesley@email.com',
      bio: 'minha primeira bio!',
      age: 25,
    };

    //Usuario
    const userId = '1';

    //Usuario logado
    const user = {
      _id: '1',
      role: 'user',
    };

    //É esperado que o banco tente achar o id e nao consiga, ache null
    mockUserModel.findByIdAndUpdate.mockResolvedValue(null);

    await expect(
      service.updateUser(userId, updateUserDto, user as User),
    ).rejects.toThrow(NotFoundException);

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      updateUserDto,
      {
        returnDocument: 'after',
      },
    );

    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  //Delete user succesfully - beeing owner
  it('should delete user succesfully beeing owner', async () => {
    //a ser deletado
    const userId = '1';

    //user logado
    const user = {
      _id: userId,
      role: 'user',
    };

    const posts = [{ _id: 'post1' }, { _id: 'post2' }];

    const mockQuery = {
      select: jest.fn().mockResolvedValue(posts),
    };

    mockPostModel.find.mockReturnValue(mockQuery);
    mockCommentModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockPostModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockUserModel.findOneAndDelete.mockResolvedValue(user);

    mockUserModel.findOneAndDelete.mockResolvedValue({ _id: userId });

    const result = await service.deleteUser(userId, user as User);

    expect(result).toEqual({ message: 'User deleted successfully' });

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: userId,
    });

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledTimes(1);
  });

  //Delete user succesfully - beeing admin
  it('should delete user succesfully beeing admin', async () => {
    //a ser deletado
    const userId = '1';

    //user logado
    const user = {
      _id: '2',
      role: 'admin',
    };

    const posts = [{ _id: 'post1' }, { _id: 'post2' }];

    const mockQuery = {
      select: jest.fn().mockResolvedValue(posts),
    };

    mockPostModel.find.mockReturnValue(mockQuery);
    mockCommentModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockPostModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
    mockUserModel.findOneAndDelete.mockResolvedValue(user);

    mockUserModel.findOneAndDelete.mockResolvedValue({ _id: userId });

    const result = await service.deleteUser(userId, user as User);

    expect(result).toEqual({ message: 'User deleted successfully' });

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: userId,
    });

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledTimes(1);
  });

  //Delete User - ForbiddenException Error
  it('should return and error if you are not the owner', async () => {
    //a ser deletado
    const userId = '1';

    //user logado
    const user = {
      _id: '2',
      role: 'user',
    };

    //nem chega ao mock do banco

    await expect(service.deleteUser(userId, user as User)).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockUserModel.findOneAndDelete).not.toHaveBeenCalledTimes(1);
  });

  //Delete User - NotFoundException Error
  it('should return NotFoundException error', async () => {
    //a ser deletado
    const userId = '1';

    //user logado
    const user = {
      _id: '1',
      role: 'user',
    };

    mockUserModel.findOneAndDelete.mockResolvedValue(null);

    await expect(service.deleteUser(userId, user as User)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: userId,
    });

    expect(mockUserModel.findOneAndDelete).toHaveBeenCalledTimes(1);
  });
});
