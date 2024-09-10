// import config from '@/config';
// import { ServerException } from '@/exceptions';
// import { logger } from '@/utils/logger';
// import Redis, { Redis as RedisClient } from 'ioredis';

// export default class RedisInstance {
//   private static instance: RedisInstance;
//   private redisClient: RedisClient;
//   private id: number;

//   private constructor() {
//     this.id = Math.random();
//     console.log(`RedisInstance instance created with ID: ${this.id}`);

//     const { PASSWORD, PORT } = config.redis;
//     this.redisClient = new Redis({
//       host: '127.0.0.1',
//       port: Number(PORT),
//       // Configure redis password if needed
//       ...(PASSWORD ? { password: PASSWORD } : {}),
//       enableReadyCheck: false,
//       maxRetriesPerRequest: null,
//     });

//     this.redisClient.on('error', err => {
//       logger.error('Redis Client Error', err);
//       throw new ServerException();
//     });

//     this.redisClient.on('connect', () => {
//       console.info(`Redis server port: ${this.redisClient.options.port}`);
//     });
//   }

//   public static getInstance(): RedisInstance {
//     if (!RedisInstance.instance) {
//       RedisInstance.instance = new RedisInstance();
//     }
//     return RedisInstance.instance;
//   }

//   public getRedisClient(): RedisClient {
//     return this.redisClient;
//   }
// }
// export const redisProcess = RedisInstance.getInstance();

// export const redisClient = new Redis({
//   host: '127.0.0.1',
//   port: 6379,
//   // configure redis password if needed
//   // password: 'mypassword08!',
//   enableReadyCheck: false,
//   maxRetriesPerRequest: null,
// });

// redisClient.on('error', err => {
//   logger.error('Redis Client Error', err);
//   throw new ServerException();
// });
// redisClient.on('connect', function () {
//   console.info(`             Redis server port: ${this.options.port}`);
// });

// const scrapeQueue = new Queue('web scraping', {
//   createClient: type => {
//     switch (type) {
//       case 'client':
//         return redisClient;
//       case 'subscriber':
//         return redisClient.duplicate({
//           enableReadyCheck: false,
//           maxRetriesPerRequest: null,
//         });
//       default:
//         return new Redis({
//           host: '127.0.0.1',
//           port: 6379,
//           // configure redis password if needed
//           // password: 'mypassword08!',
//           enableReadyCheck: false,
//           maxRetriesPerRequest: null,
//         });
//     }
//   },
//   limiter: {
//     max: 5,
//     duration: 1000,
//   },
// });

// export const StoredQueue: { process: Queue.Queue<any> | undefined } = { process: undefined };

// const initializeQueueProcess = () => {
//   if (!StoredQueue.process) {
//     Object.defineProperty(StoredQueue, 'process', {
//       value: scrapeQueue,
//       writable: false,
//       enumerable: true,
//       configurable: false,
//     });
//   }
// };

// export default initializeQueueProcess;
