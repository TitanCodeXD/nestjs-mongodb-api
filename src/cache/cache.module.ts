import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createKeyv } from '@keyv/redis';

Module({
  imports: [
    ConfigModule,
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          createKeyv(
            `redis://${configService.get<string>('REDIS_USERNAME')}:${configService.get<string>('REDIS_PASSWORD')}@${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`,
          ),
        ],
      }),
    }),
  ],
});

export class CacheModule {}
