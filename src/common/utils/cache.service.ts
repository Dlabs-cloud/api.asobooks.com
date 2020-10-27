import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
  }

  async get(key) {
    return this.cache.get(key);
  }

  async set(key, value, ttl?: number) {
    return this.cache.set(key, value, { ttl });
  }

  async del(key) {
    return this.cache.del(key);
  }
}