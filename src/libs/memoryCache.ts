import { ServerException } from '@/exceptions';
import { logger } from '@/utils/logger';
import type Redis from 'ioredis';
import RedisInstance from './redis';

class MemoryServerCache {
  private static instance: MemoryServerCache;
  public memory: Map<string, unknown> = new Map();
  private redisClient: Redis;

  private constructor() {
    this.redisClient = RedisInstance.getRedisClient();
    this.init();
  }

  public static getInstance(): MemoryServerCache {
    try {
      if (!MemoryServerCache.instance) {
        MemoryServerCache.instance = new MemoryServerCache();
      }
      return MemoryServerCache.instance;
    } catch (error) {
      console.log(error);

      logger.error('MemoryServerCache.getInstance => ', error);
      throw new ServerException(500, "Couldn't create MemoryServerCache instance");
    }
  }

  private async init() {
    try {
      const processKeys = async (cursor: string): Promise<void> => {
        const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', 'Cache.*', 'COUNT', '100');

        await Promise.all(
          keys.map(async key => {
            const data = await this.redisClient.get(key);
            this.memory.set(key.replace(/^Cache\./, ''), JSON.parse(data));
          }),
        );

        if (newCursor !== '0') {
          await processKeys(newCursor);
        }
      };
      await processKeys('0');
    } catch (error) {
      console.log(error);
      logger.error('MemoryServerCache.init => ', error);
      throw new ServerException(500, "Couldn't initialize the server memory cache");
    }
  }

  public getMemory<T>(key: string): T | undefined;
  public getMemory<T>(): Map<string, T | unknown>;

  public getMemory<T>(key?: string): T | Map<string, T | unknown> | undefined {
    try {
      if (key) {
        const value = this.memory.get(key);
        return value !== undefined ? (value as T) : undefined;
      }
      return this.memory as Map<string, T | unknown>;
    } catch (error) {
      console.log(error);
      logger.error('MemoryServerCache.getMemory => ', error);
      throw new ServerException(500, "Couldn't retrieve memory data");
    }
  }

  public async delMemory(key: string): Promise<void> {
    try {
      this.memory.delete(key);
      this.redisClient.del(`Cache.${key}`);
    } catch (error) {
      console.log(error);
      logger.error('MemoryServerCache.delMemory => ', error);
      throw new ServerException(500, "Couldn't delete memory entries");
    }
  }

  public async setMemory<T>(key: string, value: T): Promise<void> {
    try {
      this.memory.set(key, value);
      await this.redisClient.set(`Cache.${key}`, JSON.stringify(value));
    } catch (error) {
      console.log(error);
      logger.error('MemoryServerCache.setMemory => ', error);
      throw new ServerException(500, "Couldn't set memory entries");
    }
  }

  public async clearMemory(): Promise<void> {
    try {
      this.memory.clear();
      const deleteRedisKeys = async (cursor: string): Promise<void> => {
        const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', 'Cache.*', 'COUNT', '100');

        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
        if (newCursor !== '0') {
          await deleteRedisKeys(newCursor);
        }
      };
      await deleteRedisKeys('0');
    } catch (error) {
      console.log(error);
      logger.error('MemoryServerCache.clearMemory => ', error);
      throw new ServerException(500, "Couldn't clear the server memory and cache");
    }
  }
}

export default MemoryServerCache;
