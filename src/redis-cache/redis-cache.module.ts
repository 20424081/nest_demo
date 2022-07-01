import { CacheModule, Module } from '@nestjs/common';
import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from './redis-cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync<ClientOpts>({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('cache.host'),
        port: configService.get('cache.port'),
        ttl: 5,
        max: 10,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
