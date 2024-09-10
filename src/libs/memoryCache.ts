import { ServerException } from '@/exceptions';
import { logger } from '@/utils/logger';
import type Redis from 'ioredis';
import { Service } from 'typedi';
import { v7 as uuid } from 'uuid';
import RedisInstance from './redis';

@Service()
export default class MemoryServerCache {
  public memory: Map<string, unknown>;
  private redisClient: Redis;
  constructor() {
    this.memory = new Map();
    this.redisClient = RedisInstance().getRedisClient();
    this.init();
  }

  public async init() {
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
      logger.error(error);
      throw new ServerException(500, "Couldn't initialize the server memory cache");
    }
  }

  private matchedKeys(option: { keys: string } | { entries: string }) {
    if ('keys' in option) {
      return [...this.memory.keys()].filter(key => key.startsWith(option.keys));
    }
    if ('entries' in option) {
      return [...this.memory.entries()].filter(([key]) => key.startsWith(option.entries));
    }
  }

  public async getMemory<T>(options?: GetMemory): Promise<Map<string, T | unknown> | T | undefined> {
    try {
      if (options && 'key' in options) {
        const value = this.memory.get(options.key) as T;
        return value ?? undefined;
      }
      if (options && 'keys' in options) {
        const matchedEntries = this.matchedKeys({ entries: options.keys }) as [string, T][];
        const result = new Map<string, T>(matchedEntries);
        return result.size > 0 ? result : undefined;
      }
      return this.memory;
    } catch (error) {
      logger.error('Error while retrieving memory:', error);
      throw new ServerException(500, "Couldn't retrieve memory data");
    }
  }

  public async delMemory(options: GetMemory): Promise<void> {
    try {
      if (options && 'key' in options) {
        this.memory.delete(options.key);
        this.redisClient.del(`Cache.${options.key}`);
      }

      if (options && 'keys' in options) {
        const matchedKeys = this.matchedKeys({ keys: options.keys }) as string[];

        await Promise.all(
          matchedKeys.map(async key => {
            this.memory.delete(key);
            await this.redisClient.del(`Cache.${key}`);
          }),
        );
      }
    } catch (error) {
      logger.error('Error while deleting memory entries:', error);
      throw new ServerException(500, "Couldn't delete memory entries");
    }
  }

  public async setMemory<T>(options: GetMemory, value: T): Promise<void> {
    try {
      if (options && 'key' in options) {
        this.memory.set(options.key, value);
        await this.redisClient.set(`Cache.${options.key}`, JSON.stringify(value));
      }

      if (options && 'keys' in options && Array.isArray(value)) {
        const matchedKeys = this.matchedKeys({ keys: options.keys }) as string[];

        await Promise.all(
          matchedKeys.map(async (key, index) => {
            const val = value[index] || value[value.length - 1];
            this.memory.set(key, val);
            await this.redisClient.set(`Cache.${key}`, JSON.stringify(val));
          }),
        );
      }
    } catch (error) {
      logger.error('Error while setting memory entries:', error);
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
      logger.error('Error while clearing memory and Redis keys:', error);
      throw new ServerException(500, "Couldn't clear the server memory and cache");
    }
  }

  public async newUserAccessToken(id: string) {
    const refreshToken = uuid();
    await this.setMemory({ key: `refreshToken.${id}` }, refreshToken);
    return refreshToken;
  }
}
