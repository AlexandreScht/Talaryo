import { ControllerMethods, ExpressHandler } from '@/interfaces/controller';
import MemoryServerCache from '@libs/memoryCache';
import RedisInstance from '@libs/redis';
import SocketManager from '@libs/socketManager';
export default class TestControllerFile implements ControllerMethods<TestControllerFile> {
  private redisClient: typeof RedisInstance;
  private MemoryServer: typeof MemoryServerCache;
  private SocketIo: SocketManager;
  constructor() {
    this.redisClient = RedisInstance;
    this.MemoryServer = MemoryServerCache;
    this.SocketIo = SocketManager.getInstance();
  }

  protected test: ExpressHandler = async ({ res, req, next }) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');

      const fullUrl = `${protocol}://${host}/api`;

      console.log('URL complète :', fullUrl);

      res.send(`L'URL complète est : ${fullUrl}`);
    } catch (error) {
      next(error);
    }
  };
}
