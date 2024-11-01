import { ServerException } from '@/exceptions';
import { cvScrapingForm, cvStrategiesResult } from '@/interfaces/scrapping';
import type { cvStream, processData, streamTask, taskProps } from '@/interfaces/stream';
import ScoreServiceFile from '@/services/scores';
import serializeCvStream from '@/strategys/cvStream';
import { logger } from '@/utils/logger';
import MemoryServerCache from '@libs/memoryCache';
import SocketManager from '@libs/socketManager';
import type Redis from 'ioredis';
import Container from 'typedi';
import { v7 as uuid } from 'uuid';
import RedisInstance from './redis';

export default class StreamManager {
  private userId: string;
  private redisClient: Redis;
  private ScoreServices: ScoreServiceFile;
  private MemoryServer: MemoryServerCache;
  private static initializedUsers: Set<string> = new Set();
  private SocketIo: SocketManager;
  private streamId: string;
  private streamCache: unknown = undefined;

  constructor(id: number | string) {
    this.redisClient = RedisInstance.getRedisClient();
    this.SocketIo = SocketManager.getInstance();
    this.MemoryServer = MemoryServerCache.getInstance();
    this.ScoreServices = Container.get(ScoreServiceFile);
    const userId = typeof id === 'number' ? String(id) : id;
    this.userId = userId;

    if (!StreamManager.initializedUsers.has(userId)) {
      this.init(userId);
      StreamManager.initializedUsers.add(userId);
    }
  }

  private async getStreamUser(userId: string): Promise<{ key: string; value: taskProps }[]> {
    try {
      const processKeys = async (
        cursor: string,
        acc: { key: string; value: taskProps & Record<string, any> }[] = [],
      ): Promise<{ key: string; value: taskProps & Record<string, any> }[]> => {
        const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', `Stream.${userId}.*`, 'COUNT', '100');

        const keyValuePairs = await Promise.all(
          keys.map(async key => {
            try {
              const value = await this.redisClient.get(key);
              if (!value) {
                return undefined;
              }
              try {
                return { key, value: JSON.parse(value) };
              } catch (error) {
                return { key, value };
              }
            } catch (error) {
              console.log(error);
              logger.error('StreamManager.getStreamUser => ', error);
              return undefined;
            }
          }),
        );

        const filteredPairs = keyValuePairs.filter(v => !!v) as {
          key: string;
          value: taskProps & Record<string, any>;
        }[];

        if (newCursor !== '0') {
          return await processKeys(newCursor, acc.concat(filteredPairs));
        }

        return acc.concat(filteredPairs);
      };

      return await processKeys('0', []);
    } catch (error) {
      logger.error('StreamManager.getStreamUser => ', error);
      return [];
    }
  }

  private async init(userId: string) {
    try {
      const keyValuePairs = await this.getStreamUser(userId);

      await Promise.all(
        keyValuePairs?.map(async ({ key, value }) => {
          if (value.task === 'cv') {
            await this.ScoreServices.decrementCv(Number(userId));
          }
          await this.redisClient.del(key);
          await this.MemoryServer.delMemory(key);
        }),
      );
    } catch (error) {
      logger.error('StreamManager.init => ', error);
      throw new ServerException(500, "Couldn't initialize the stream manager");
    }
  }

  public async newStream<T, A extends object, V>({
    streamValues,
    streamOption,
    userId,
    streamTask,
    memoryValue,
  }: {
    streamValues: T[];
    streamOption: A;
    userId: number;
    streamTask: streamTask;
    memoryValue?: Map<string, unknown>;
  }): Promise<{ firstResult: V | undefined; ignored: number } | undefined> {
    try {
      this.streamId = `Stream.${userId}.${uuid()}`;
      const previousTasksFromUser = await this.getStreamUser(String(userId));

      if (previousTasksFromUser?.length) {
        await Promise.all(
          previousTasksFromUser.map(async ({ key: previousKey, value: previousvalue }) => {
            if (previousvalue.task === streamTask) {
              //* to cancel previous same task
              await this.MemoryServer.setMemory(previousKey, true);
            }
          }),
        );
      }
      this.streamCache = memoryValue;

      await this.redisClient.set(this.streamId, JSON.stringify({ task: streamTask } as taskProps));
      return await this.process<T, A, V>({ streamValues, streamOption, streamTask });
    } catch (error) {
      console.log(error);

      logger.error('StreamManager.newStream => ', error);
      throw new ServerException();
    }
  }

  private async checkStream() {
    const previousActiveTasks = await this.MemoryServer.getMemory(this.streamId);
    if (previousActiveTasks) {
      await this.MemoryServer.delMemory(this.streamId);
      await this.redisClient.del(this.streamId);
      return true;
    }
    return false;
  }

  private async process<T, A, V>({
    streamValues,
    streamOption,
    streamTask,
  }: {
    streamValues: T[];
    streamOption: A;
    streamTask: streamTask;
  }): Promise<{ firstResult: V | undefined; ignored: number } | undefined> {
    try {
      const processResult = {
        firstResult: undefined,
        ignored: 0,
        remainingValues: [],
      } as processData<T, V>;

      for (const [idx, value] of streamValues.entries()) {
        const previousActiveTasks = await this.checkStream();
        if (previousActiveTasks) {
          return undefined;
        }

        const result = (await this.streamStrategies({ value, streamOption }, streamTask)) as V;
        if (result !== undefined) {
          processResult.firstResult = result;
          processResult.ignored = idx;
          processResult.remainingValues = streamValues.slice(idx + 1);
          break;
        }
      }

      if (!processResult?.firstResult) {
        await this.redisClient.del(this.streamId);
        return undefined;
      }

      const { firstResult, ignored, remainingValues } = processResult;

      this.execute<T, A, V>({ remainingValues, streamOption, streamTask });

      return { firstResult, ignored };
    } catch (error) {
      logger.error('StreamManager.process => ', error);
      throw new ServerException();
    }
  }

  private async execute<T, A, V>({ remainingValues, streamOption, streamTask }: { remainingValues: T[]; streamOption: A; streamTask: streamTask }) {
    try {
      let CancelStream = false;
      for (const value of remainingValues) {
        const previousActiveTasks = await this.checkStream();
        if (previousActiveTasks) {
          CancelStream = true;
          break;
        }

        const result = (await this.streamStrategies({ value, streamOption }, streamTask)) as V;

        this.SocketIo.ioSendTo(this.userId, {
          eventName: streamTask,
          body: result || { error: true },
          date: new Date().toLocaleDateString('fr-FR'),
        });
      }

      this.SocketIo.ioSendTo(this.userId, {
        eventName: streamTask,
        body: CancelStream ? { isCancel: true } : { isEnd: true },
        date: new Date().toLocaleDateString('fr-FR'),
      });

      await this.redisClient.del(this.streamId);
    } catch (error) {
      console.log(error);

      logger.error('StreamManager.execute => ', error);
      throw new ServerException();
    }
  }

  private async streamStrategies(data: Record<string, unknown>, streamTask: streamTask) {
    if (streamTask === 'cv') {
      const { value: link, streamOption: cvScrapingForm } = data as { value: string; streamOption: cvScrapingForm };
      const result = await serializeCvStream<cvStrategiesResult>({ link, cvScrapingForm } as cvStream);
      if (!result) return;
      return {
        ...result,
        favFolderId: (this.streamCache as Map<string, number>).get(result.pdf) || undefined,
      };
    }
  }
}
