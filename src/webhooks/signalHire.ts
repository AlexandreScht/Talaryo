import ScoreServiceFile from '@/services/scores';
import MemoryServerCache from '@libs/memoryCache';
import SocketManager from '@libs/socketManager';
import { logger } from '@utils/logger';
import { NextFunction, Request, Response } from 'express';
import Container, { Service } from 'typedi';

@Service()
export default class SignalHireWebhook {
  private SocketIo: SocketManager;
  private MemoryServer: MemoryServerCache;
  private ScoreService: ScoreServiceFile;

  constructor() {
    this.SocketIo = SocketManager.getInstance();
    this.MemoryServer = MemoryServerCache.getInstance();
    this.ScoreService = Container.get(ScoreServiceFile);
  }

  public Event = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestId = req.headers['request-id'];
      const [
        {
          candidate: { contacts },
        },
      ] = req.body;
      const storedRequest = this.MemoryServer.getMemory<{ userId: number; link: string }>(`signalHire.${requestId}`);
      if (!storedRequest) return;

      const { userId, link } = storedRequest;

      if (contacts?.length) {
        this.ScoreService.improveScore(['mails'], 1, userId);
      }

      this.SocketIo.ioSendTo(userId, {
        eventName: 'SignalHireResponse',
        body: {
          contacts: contacts
            ?.map((data: { value: string; type: 'email' | 'phone'; rating: number }) => {
              if (data)
                return {
                  type: data.type,
                  value: data.value,
                  rating: data.rating,
                };
            })
            .filter((v: any) => v),
          link,
        },
      });
      await this.MemoryServer.delMemory(`signalHire.${requestId}`);
      res.send();
    } catch (error) {
      logger.error('SignalHereWebhook.Event =>' + error);
      next(error);
    }
  };
}
