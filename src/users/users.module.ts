import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

//Mongo and User
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    //Aqui de fato criamos nosso schema de usuário, que será utilizado para criar o model do Mongoose.
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
