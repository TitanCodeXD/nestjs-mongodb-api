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
import { Comment } from '../comments/schemas/comment.schema';

//User
import { User } from 'src/users/schemas/user.schema';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const mockPostModel = {
  find: jest.fn(),
  populate: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockCommentModel = {
  deleteMany: jest.fn(),
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
        {
          provide: getModelToken(Comment.name), //Pegar o token do PostModel para conseguirmos 'simular'/mock do banco
          useValue: mockCommentModel, //Mock das funçoes
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

  it('should create a post', async () => {
    const createPostDto: CreatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
    };

    mockPostModel.create.mockResolvedValue({
      ...createPostDto,
      author: user._id,
    });

    const result = await service.createPost(createPostDto, user as User);

    expect(result).toEqual({ ...createPostDto, author: user._id });

    expect(mockPostModel.create).toHaveBeenCalledWith({
      ...createPostDto,
      author: user._id,
    });
    expect(mockPostModel.create).toHaveBeenCalledTimes(1);
  });

  it('should return BadRequestException if invalid object Id', async () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
    };

    const invalidId = '123';

    await expect(
      service.updatePost(invalidId, updatePostDto, user as User),
    ).rejects.toThrow(BadRequestException);

    expect(mockPostModel.findByIdAndUpdate).not.toHaveBeenCalledTimes(1);
  });

  it('should return NotFoundException if post does not exist', async () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
    };

    const notFoundId = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(null);

    await expect(
      service.updatePost(notFoundId, updatePostDto, user as User),
    ).rejects.toThrow(NotFoundException);

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);
  });

  it('should update the post successfully beeing owner of the post', async () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
      role: 'user',
    };

    const post = {
      author: '123',
    };

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    mockPostModel.findByIdAndUpdate.mockResolvedValue({
      _id: id,
      ...post,
      ...updatePostDto,
    });

    const result = await service.updatePost(id, updatePostDto, user as User);

    expect(result).toEqual({ message: 'Post updated successfully!' });

    expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('should update the post successfully beeing admin', async () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
      role: 'admin',
    };

    const post = {
      author: '1234',
    };

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    mockPostModel.findByIdAndUpdate.mockResolvedValue({
      _id: id,
      ...post,
      ...updatePostDto,
    });

    const result = await service.updatePost(id, updatePostDto, user as User);

    expect(result).toEqual({ message: 'Post updated successfully!' });

    expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
  });

  it('should return ForbiddenException if user is not an admin and not the owner of the post to update post', async () => {
    const updatePostDto: UpdatePostDto = {
      title: 'Título',
      content: 'Conteúdo',
      tags: ['animais', 'gatos'],
    };

    const user = {
      _id: '123',
      role: 'user',
    };

    const post = {
      author: '1234',
    };

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    await expect(
      service.updatePost(id, updatePostDto, user as User),
    ).rejects.toThrow(ForbiddenException);

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockPostModel.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should return BadRequestException if invalid object Id to delete post', async () => {
    const user = {
      _id: '123',
    };

    const invalidId = '123';

    await expect(service.deletePost(invalidId, user as User)).rejects.toThrow(
      BadRequestException,
    );

    expect(mockPostModel.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it('should return NotFoundException if post does not exist', async () => {
    const user = {
      _id: '123',
    };

    const notFoundId = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(null);

    await expect(service.deletePost(notFoundId, user as User)).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPostModel.findById).toHaveBeenCalledWith(notFoundId);

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);
  });

  it('should delete the post if user is the owner of the post', async () => {
    const user = {
      _id: '123',
      role: 'user',
    };

    const post = {
      _id: '1234',
      author: '123',
    };

    const commentsOfThePost = [
      {
        post: '1234',
        content: 'comentario 1',
      },
      { post: '1234', content: 'comentario 2' },
    ];

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    mockPostModel.findByIdAndDelete.mockResolvedValue({ ...post, id, user });

    const result = await service.deletePost(id, user as User);

    expect(result).toEqual({ message: 'Post deleted successfully!' });

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
  });

  it('should delete the post if user is admin', async () => {
    const user = {
      _id: '123',
      role: 'admin',
    };

    const post = {
      author: '1234',
    };

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    mockPostModel.findByIdAndDelete.mockResolvedValue({ ...post, id, user });

    const result = await service.deletePost(id, user as User);

    expect(result).toEqual({ message: 'Post deleted successfully!' });

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockPostModel.findByIdAndDelete).toHaveBeenCalledTimes(1);
  });

  it('should return ForbiddenException if user is not an admin and not the owner of the post to delete', async () => {
    const user = {
      _id: '123',
      role: 'user',
    };

    const post = {
      author: '1234',
    };

    const id = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(post);

    await expect(service.deletePost(id, user as User)).rejects.toThrow(
      ForbiddenException,
    );

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockPostModel.findByIdAndDelete).not.toHaveBeenCalled();
  });
});
