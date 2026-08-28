import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

//Mongo and User
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';

//Queue
import { QueueService } from 'src/queue/queue.service';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    //Aqui de fato criamos nosso schema de usuário, que será utilizado para criar o model do Mongoose.
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
    QueueModule, //Queue
  ],

  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
