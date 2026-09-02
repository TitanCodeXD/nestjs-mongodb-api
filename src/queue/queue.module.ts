import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './email.processor';
import { QueueService } from './queue.service';
import { EmailService } from './email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { QueueBoardService } from './queue-board.service';

@Module({
  imports: [
    ConfigModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USERNAME'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
    }),

    BullModule.registerQueue({
      name: 'verify-email',
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],

  providers: [EmailProcessor, QueueService, EmailService, QueueBoardService],

  exports: [QueueService, QueueBoardService],
})
export class QueueModule {}
