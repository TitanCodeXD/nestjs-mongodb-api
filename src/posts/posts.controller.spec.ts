import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';

//Service
import { PostsService } from './posts.service';

//Mocks
const mockPostsService = {};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
