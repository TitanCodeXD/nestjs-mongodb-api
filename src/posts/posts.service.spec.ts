import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';

//Token e userSchema
import { getModelToken } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';

//Dto
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const mockPostModel = {
  find: jest.fn(),
  populate: jest.fn(),
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
      populate: jest.fn().mockResolvedValue(posts),
    };

    mockPostModel.find.mockReturnValue(mockQuery);

    const result = await service.findAllPosts();

    expect(result).toEqual(posts);

    expect(mockPostModel.find).toHaveBeenCalledTimes(1);

    expect(mockQuery.populate).toHaveBeenCalledWith('author', 'name');
  });
});
