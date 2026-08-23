import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';

//Errors
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { Post } from '../posts/schemas/post.schema';

//User
import { User } from 'src/users/schemas/user.schema';

//Dto
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const mockCommentModel = {
  find: jest.fn(),
};

const mockPostModel = {
  find: jest.fn(),
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
});
