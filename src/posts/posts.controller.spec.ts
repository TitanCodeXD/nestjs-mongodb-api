import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';

//Service
import { PostsService } from './posts.service';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

//Mocks
const mockPostsService = {
  findAllPosts: jest.fn(),
  findPostById: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
};

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

  it('should return all posts', async () => {
    const posts = [
      {
        _id: '123',
        title: 'Wesley',
        content: 'wesley@hotmail.com',
        tags: ['testes', 'teste'],
      },
      {
        _id: '456',
        title: 'Wesley',
        content: 'wesley@hotmail.com',
        tags: ['testes', 'teste'],
      },
    ];

    mockPostsService.findAllPosts.mockResolvedValue(posts);

    const result = await controller.findAllPosts();

    expect(result).toEqual(posts);
  });

  it('should return post by id', async () => {
    const post = {
      _id: '123',
      title: 'Wesley',
      content: 'wesley@hotmail.com',
      tags: ['testes', 'teste'],
    };

    const id = '123';

    mockPostsService.findPostById.mockResolvedValue(post);

    const result = await controller.findPostById(id);

    expect(result).toEqual(post);

    expect(mockPostsService.findPostById).toHaveBeenCalledWith(id);
  });

  it('should craete a post', async () => {
    const createPost: CreatePostDto = {
      title: 'Wesley',
      content: 'wesley@hotmail.com',
      tags: ['testes', 'teste'],
    };

    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    mockPostsService.createPost.mockResolvedValue(createPost);

    const result = await controller.create(createPost, req);

    expect(result).toEqual(createPost);

    expect(mockPostsService.createPost).toHaveBeenCalledWith(
      createPost,
      req.user,
    );
  });

  it('should update a post', async () => {
    const updatePost: UpdatePostDto = {
      title: 'Wesley',
      content: 'wesley@hotmail.com',
      tags: ['testes', 'teste'],
    };

    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    const id = '123';

    mockPostsService.updatePost.mockResolvedValue(updatePost);

    const result = await controller.updatePost(id, updatePost, req);

    expect(result).toEqual(updatePost);

    expect(mockPostsService.updatePost).toHaveBeenCalledWith(
      id,
      updatePost,
      req.user,
    );
  });

  it('should delete a post', async () => {
    const user = {
      id: '123',
    };

    const req = {
      user,
    };

    const id = '123';

    mockPostsService.deletePost.mockResolvedValue(id);

    const result = await controller.remove(id, req);

    expect(result).toEqual(id);

    expect(mockPostsService.deletePost).toHaveBeenCalledWith(id, req.user);
  });
});
