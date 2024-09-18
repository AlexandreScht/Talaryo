import { MongodbConnection } from '@/database/mongo';
import { PGdbConnection } from '@/database/pg';
import config from '@config';
import RedisInitializer from '@libs/redis';
import initializeSocket from '@libs/socketManager';
import { ErrorMiddleware } from '@middlewares/error';
import { logger, stream } from '@utils/logger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import { IpFilter } from 'express-ipfilter';
import helmet from 'helmet';
import hpp from 'hpp';
import http from 'http';
import morgan from 'morgan';
import 'reflect-metadata';
import { Server } from 'socket.io';
import ApiRouter from './routes';
const {
  log,
  security: {
    cookie: { COOKIE_TOKEN },
  },
} = config;

export default class App extends ApiRouter {
  public app: express.Application;
  public env: string;
  public port: string | number;
  private server: http.Server;
  private io: Server;

  constructor() {
    super();
    this.app = express();
    this.env = config.NODE_ENV || 'development';
    this.port = config.PORT || 3005;
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.connectToDatabase();
    this.initializeStoredLibs();
    this.initializeMiddlewares();
    this.initializeAppRoutes();
    this.initializeErrorHandling();
    this.defaultError();
  }

  public listen() {
    this.server.listen(this.port, () => {
      logger.info(`======= Version: ${this.env} =======
        🚀 server listening port: ${this.port} 🚀`);
    });
    return this.server;
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    await PGdbConnection();
    await MongodbConnection();
  }

  private initializeMiddlewares() {
    this.app.use(morgan(log.FORMAT, { stream }));
    this.app.use(
      cors({
        origin: config.ORIGIN,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
      }),
    );
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.initializeBodyContent();
    this.app.use(IpFilter(config.allowedIp, { mode: 'allow', log: false }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(COOKIE_TOKEN));
    this.app.options(
      '*',
      cors({
        origin: config.ORIGIN,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
      }),
    );
  }

  private initializeBodyContent() {
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      //  for stripe webhook
      if (req.url === '/api/stripe_webhook') {
        express.raw({ type: 'application/json' })(req, res, next);
      } else {
        express.json()(req, res, next);
      }
    });
  }

  private initializeStoredLibs() {
    RedisInitializer();
    initializeSocket(this.io);
  }

  private initializeAppRoutes() {
    super.initializeRoutes();
    this.app.use('/api', this.router);
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private defaultError() {
    this.app.use((req: Request, res: Response) => {
      res
        .status(404)
        .setHeader('Content-Type', 'application/json; charset=utf-8')
        .send({ error: `Cannot find or << ${req.method} >> is incorrect method at ${req.url}` });
    });
  }
}
