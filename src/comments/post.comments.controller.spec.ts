import { Test, TestingModule } from '@nestjs/testing';
import { PostCommentsController } from './post.comments.controller';

//Service
import { CommentsService } from './comments.service';

//Dto
import { CreateCommentDto } from './dto/create-comment.dto';

//Mocks
const mockPostCommentsService = {
  createComment: jest.fn(),
  findPostComments: jest.fn(),
};

describe('PostCommentsController', () => {
  let controller: PostCommentsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockPostCommentsService,
        },
      ],
    }).compile();

    controller = module.get<PostCommentsController>(PostCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a comment on a post', async () => {
    const createCommentDto: CreateCommentDto = {
      content: 'texto',
    };

    const postId = '123';

    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    mockPostCommentsService.createComment.mockResolvedValue(createCommentDto);

    const result = await controller.createComment(
      postId,
      createCommentDto,
      req,
    );

    expect(result).toEqual(createCommentDto);

    expect(mockPostCommentsService.createComment).toHaveBeenCalledWith(
      postId,
      createCommentDto,
      req.user,
    );
  });

  it('should return comments of a post', async () => {
    const post = {
      id: '123',
      content: 'texto',
    };

    const postId = '123';

    mockPostCommentsService.findPostComments.mockResolvedValue(post);

    const result = await controller.findPostComments(postId);

    expect(result).toEqual(post);

    expect(mockPostCommentsService.findPostComments).toHaveBeenCalledWith(
      postId,
    );
  });
});
