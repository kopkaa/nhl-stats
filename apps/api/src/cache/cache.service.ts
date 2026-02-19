import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const DEFAULT_TTL = 300;

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.getOrThrow<string>('REDIS_URL');
    this.redis = new Redis(redisUrl);

    this.redis.on('connect', () => this.logger.log('Connected to Redis'));
    this.redis.on('error', (err) => this.logger.error('Redis error', err));
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);

    if (!raw) {
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return JSON.parse(raw) as T;
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds = DEFAULT_TTL,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delByPrefix(prefix: string): Promise<number> {
    const keys = await this.redis.keys(`${prefix}*`);
    if (keys.length === 0) return 0;
    await this.redis.del(...keys);
    this.logger.debug(`Cache invalidated: ${keys.length} keys (${prefix}*)`);
    return keys.length;
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  async ping(): Promise<boolean> {
    const result = await this.redis.ping();
    return result === 'PONG';
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
