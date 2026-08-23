import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';

//Errors
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

//Mongoose
import { Types } from 'mongoose';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { Post } from '../posts/schemas/post.schema';

//User
import { User } from 'src/users/schemas/user.schema';

//Dto
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { resourceLimits } from 'worker_threads';

const mockCommentModel = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockPostModel = {
  find: jest.fn(),
  findById: jest.fn(),
};

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getModelToken(Comment.name), //Pegar o token do CommentModel para conseguirmos 'simular'/mock do banco
          useValue: mockCommentModel, //Mock das funçoes
        },
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all comments', async () => {
    const comments = [
      {
        content: 'comentario 1',
      },
      {
        content: 'comentario 2',
      },
    ];

    mockCommentModel.find.mockResolvedValue(comments);

    const result = await service.findAllComments();

    expect(result).toEqual(comments);
  });

  it('should return BadRequestException if invalid comment id', async () => {
    const id = '123';

    await expect(service.findCommentById(id)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return NotFoundException if comment id does not exist', async () => {
    const commentId = '6a84e6cb20b4580b66612fc9';

    const mockQuery = {
      populate: jest.fn().mockResolvedValue(null),
    };

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockResolvedValueOnce(null);

    mockCommentModel.findById.mockReturnValue(mockQuery);

    await expect(service.findCommentById(commentId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return BadRequestException if invalid post id', async () => {
    const createComment: CreateCommentDto = {
      content: 'Conteúdo',
    };

    const user = {
      _id: '123',
    };

    const postId = '123';

    await expect(
      service.createComment(postId, createComment, user as User),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return NotFoundException if post does not found', async () => {
    const createComment: CreateCommentDto = {
      content: 'Conteúdo',
    };

    const user = {
      _id: '123',
    };

    const postId = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(null);

    await expect(
      service.createComment(postId, createComment, user as User),
    ).rejects.toThrow(NotFoundException);
  });

  it('should create a comment', async () => {
    const createCommentDto: CreateCommentDto = {
      content: 'Conteúdo',
    };

    const user = {
      _id: '123',
    };

    const postId = '6a84e6cb20b4580b66612fc9';

    const post = {
      _id: postId,
    };

    const mockComment = {
      ...createCommentDto,
      post: postId,
      author: user._id,
      populate: jest.fn(),
    };

    mockPostModel.findById.mockResolvedValue(post);

    mockComment.populate.mockResolvedValue(mockComment);

    mockCommentModel.create.mockResolvedValue(mockComment);

    const result = await service.createComment(
      postId,
      createCommentDto,
      user as User,
    );

    expect(result).toEqual(mockComment);

    expect(mockPostModel.findById).toHaveBeenCalledWith(postId);

    expect(mockCommentModel.create).toHaveBeenCalledWith({
      ...createCommentDto,
      post: postId,
      author: user._id,
    });

    expect(mockComment.populate).toHaveBeenCalledWith('author', 'name');

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockCommentModel.create).toHaveBeenCalledTimes(1);
  });

  it('should return BadRequestException if invalid post id', async () => {
    const createComment: CreateCommentDto = {
      content: 'Conteúdo',
    };

    const user = {
      _id: '123',
    };

    const postId = '123';

    await expect(service.findPostComments(postId)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return NotFoundException if post does not found', async () => {
    const createComment: CreateCommentDto = {
      content: 'Conteúdo',
    };

    const user = {
      _id: '123',
    };

    const postId = '6a84e6cb20b4580b66612fc9';

    mockPostModel.findById.mockResolvedValue(null);

    await expect(service.findPostComments(postId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return all comments of a post', async () => {
    const postId = '6a84e6cb20b4580b66612fc9';

    const post = {
      _id: postId,
    };

    const comments = [
      {
        content: 'Primeiro comentário',
        post: postId,
        author: '123',
      },
      {
        content: 'Segundo comentário',
        post: postId,
        author: '456',
      },
    ];

    const mockQuery = {
      sort: jest.fn(),
      populate: jest.fn(),
    };

    mockPostModel.findById.mockResolvedValue(post);

    mockQuery.sort.mockReturnValue(mockQuery);

    mockQuery.populate
      .mockReturnValueOnce(mockQuery)
      .mockResolvedValueOnce(comments);

    mockCommentModel.find.mockReturnValue(mockQuery);

    const result = await service.findPostComments(postId);

    expect(result).toEqual(comments);

    expect(mockPostModel.findById).toHaveBeenCalledWith(postId);

    expect(mockCommentModel.find).toHaveBeenCalledWith({
      post: new Types.ObjectId(postId),
    });

    expect(mockQuery.sort).toHaveBeenCalledWith({
      createdAt: -1,
    });

    expect(mockQuery.populate).toHaveBeenNthCalledWith(1, 'author', 'name');

    expect(mockQuery.populate).toHaveBeenNthCalledWith(2, 'post', 'title');

    expect(mockPostModel.findById).toHaveBeenCalledTimes(1);

    expect(mockCommentModel.find).toHaveBeenCalledTimes(1);
  });
});
