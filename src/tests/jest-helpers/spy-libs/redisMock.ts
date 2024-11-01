import RedisInstance from '@/libs/redis';
import Redis from 'ioredis';

class mockRedisClient {
  private static instance: mockRedisClient;
  public redisDataStore = new Map<string, string>();

  private constructor() {}

  public static getInstance(): mockRedisClient {
    if (!mockRedisClient.instance) {
      mockRedisClient.instance = new mockRedisClient();
    }
    return mockRedisClient.instance;
  }

  public async scan(cursor: string, ...args: any[]) {
    const keys = Array.from(this.redisDataStore.keys());
    let count = 10;
    let matchPattern = '*';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === 'MATCH') {
        matchPattern = args[i + 1];
        i++;
      } else if (args[i] === 'COUNT') {
        count = parseInt(args[i + 1], 10);
        i++;
      }
    }
    const regex = new RegExp(`^${matchPattern.replace(/\*/g, '.*')}$`);
    const matchedKeys = keys.filter(key => regex.test(key));
    const startIndex = Number(cursor);
    const endIndex = startIndex + count;
    const keysBatch = matchedKeys.slice(startIndex, endIndex);
    const newCursor = endIndex >= matchedKeys.length ? '0' : String(endIndex);
    return [newCursor, keysBatch];
  }

  public async get(key: string) {
    this.redisDataStore.get(key);
  }

  public async set(key: string, value: string) {
    try {
      this.redisDataStore.set(key, value);
    } catch (error) {
      console.log(error);
    }
  }

  public async del(keys: string | string[]) {
    if (Array.isArray(keys)) {
      keys.forEach(key => this.redisDataStore.delete(key));
    } else {
      this.redisDataStore.delete(keys);
    }
  }
}

export default function RedisInstanceMocked() {
  const mockRedisInstanceMock = mockRedisClient.getInstance();
  jest.spyOn(RedisInstance, 'getRedisClient').mockReturnValue(mockRedisInstanceMock as unknown as Redis);
  const scan = jest.spyOn(mockRedisInstanceMock, 'scan');
  const get = jest.spyOn(mockRedisInstanceMock, 'get');
  const set = jest.spyOn(mockRedisInstanceMock, 'set');
  const del = jest.spyOn(mockRedisInstanceMock, 'del');
  mockRedisInstanceMock.redisDataStore.clear();
  const redisDataStore = mockRedisInstanceMock.redisDataStore;

  return { scan, get, set, del, redisDataStore };
}
