import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';

//Service
import { CommentsService } from './comments.service';

//Dto
import { UpdateCommentDto } from './dto/update-comment.dto';

//Mocks
const mockCommentsService = {
  findAllComments: jest.fn(),
  findCommentById: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
};

describe('CommentsController', () => {
  let controller: CommentsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all comments', async () => {
    const comments = [
      {
        _id: '123',
        author: 'Wesley',
        content: 'wesley@hotmail.com',
      },
      {
        _id: '456',
        author: 'João',
        content: 'joao@hotmail.com',
      },
    ];

    mockCommentsService.findAllComments.mockResolvedValue(comments);

    const result = await controller.findAllComments();

    expect(result).toEqual(comments);

    expect(mockCommentsService.findAllComments).toHaveBeenCalled();
  });

  it('should return a comment by id', async () => {
    const comment = {
      _id: '123',
      author: 'Wesley',
      content: 'wesley@hotmail.com',
    };

    const id = '123';

    mockCommentsService.findCommentById.mockResolvedValue(comment);

    const result = await controller.findCommentById(id);

    expect(result).toEqual(comment);

    expect(mockCommentsService.findCommentById).toHaveBeenCalledWith(id);
  });

  it('should update a comment', async () => {
    const updateCommentDto: UpdateCommentDto = {
      content: 'wesley@hotmail.com',
    };

    const id = '123';

    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    mockCommentsService.updateComment.mockResolvedValue(updateCommentDto);

    const result = await controller.updateComment(id, updateCommentDto, req);

    expect(result).toEqual(updateCommentDto);

    expect(mockCommentsService.updateComment).toHaveBeenCalledWith(
      id,
      updateCommentDto,
      req.user,
    );
  });

  it('should delete a comment', async () => {
    const id = '123';

    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    mockCommentsService.deleteComment.mockResolvedValue(id);

    const result = await controller.remove(id, req);

    expect(result).toEqual(id);

    expect(mockCommentsService.deleteComment).toHaveBeenCalledWith(
      id,
      req.user,
    );
  });
});
