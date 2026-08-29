import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { APP_GUARD } from '@nestjs/core';
//User
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

//JWT
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      //APP GUARD: O NestJS permite que você defina um guard globalmente para toda a aplicação, em vez de aplicá-lo a cada rota individualmente. Isso é feito usando o token APP_GUARD. Ao fornecer o JwtAuthGuard como um APP_GUARD, você está dizendo ao NestJS que deseja que todas as rotas da aplicação sejam protegidas por esse guard, a menos que você especifique o contrário em uma rota específica.
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AuthModule {}
