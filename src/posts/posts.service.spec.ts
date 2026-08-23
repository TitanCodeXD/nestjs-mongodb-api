import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';

//Errors
//Errors
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const mockPostModel = {
  find: jest.fn(),
  populate: jest.fn(),
  findById: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name), //Pegar o token do PostModel para conseguirmos 'simular'/mock do banco
          useValue: mockPostModel, //Mock das funçoes
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all post documents', async () => {
    const posts = [
      {
        title: 'Título',
        author: 'Dono',
        content: 'Conteúdo',
        tags: ['animais', 'gatos'],
      },
      {
        title: 'Título',
        author: 'Dono',
        content: 'Conteúdo',
        tags: ['animais', 'gatos'],
      },
    ];

    const mockQuery = {
      populate: jest.fn().mockResolvedValue(posts), //Resolved poir é o fim da 'cadeia de funções agregadas'
    };

    mockPostModel.find.mockReturnValue(mockQuery); //Return pois precisa do contexto para o .populate

    const result = await service.findAllPosts();

    expect(result).toEqual(posts);

    expect(mockPostModel.find).toHaveBeenCalledTimes(1);

    expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name');
  });

  it('should return BadRequestException if invalid post Id', async () => {
    await expect(service.findPostById('213')).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPostModel.findById).not.toHaveBeenCalled();
  });

  it('should return a post by post Id', async () => {
    const post = {
      _id: '6a84e6cb20b4580b66612ff9',
      title: 'Título',
      author: 'Dono',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const mockQuery = {
      populate: jest.fn().mockResolvedValue(post),
    };

    mockPostModel.findById.mockReturnValue(mockQuery);

    const result = await service.findPostById('6a84e6cb20b4580b66612ff9');

    expect(result).toEqual(post);

    expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name');

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);
  });

  it('should return NotFoundException if Post Id does not exist', async () => {
    const id = '6a84e6cb20b4580b66612fc9';

    const mockQuery = {
      populate: jest.fn().mockResolvedValue(null),
    };

    mockPostModel.findById.mockReturnValue(mockQuery);

    await expect(service.findPostById(id)).rejects.toThrow(NotFoundException);

    expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name');

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);
  });
});
