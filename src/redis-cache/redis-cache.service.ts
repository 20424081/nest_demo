import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { createHmac } from 'crypto';

@Injectable()
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly configService: ConfigService,
  ) {}

  // Get value cache with key
  async get(key: string): Promise<any> {
    const hashKey = await this.genHashSHA1(key);
    return await this.cache.get(hashKey);
  }

  // Set cache by key with time to life
  async set(key: string, ttl: number, value: string): Promise<any> {
    const hashKey = await this.genHashSHA1(key);
    return await this.cache.set(hashKey, value, { ttl: ttl });
  }

  // Delete cache by key
  async del(key: string): Promise<any> {
    const hashKey = await this.genHashSHA1(key);
    return await this.cache.del(hashKey);
  }

  // Hash key with SHA1
  async genHashSHA1(key: string): Promise<string> {
    return createHmac('sha1', this.configService.get('hash_private_key'))
      .update(key)
      .digest('hex');
  }
}
