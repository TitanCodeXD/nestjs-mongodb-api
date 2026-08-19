import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

//Import do schema do comment e do post
import { Model } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import { CommentSchema } from './schemas/comment.schema';
import { Post } from '../posts/schemas/post.schema';
import { PostSchema } from '../posts/schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Comment.name,
        schema: CommentSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
