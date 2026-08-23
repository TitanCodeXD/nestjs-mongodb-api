import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';

//Service
import { CommentsService } from './comments.service';

//Mocks
const mockCommentsService = {};

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
});
