import dotenv from 'dotenv';
import { executablePath } from 'puppeteer';
dotenv.config();

const config = {
  CREDENTIALS: process.env.CREDENTIALS === 'true',
  ORIGIN: process.env.ORIGIN,
  db: {
    mongo: {
      DB_USER: process.env.MONGO_DB_USER,
      DB_PASSWORD: process.env.MONGO_DB_PASSWORD,
      DB_HOST: process.env.MONGO_DB_HOST,
      DB_PORT: process.env.MONGO_DB_PORT,
      DB_DATABASE: process.env.MONGO_DB_DATABASE,
    },
    pg: {
      DB_USER: process.env.PG_DB_USER,
      DB_PASSWORD: process.env.PG_DB_PASSWORD,
      DB_HOST: process.env.PG_DB_HOST,
      DB_PORT: process.env.PG_DB_PORT,
      DB_DATABASE: process.env.PG_DB_DATABASE,
    },
  },
  redis: {
    PORT: process.env.REDIS_PORT,
    PASSWORD: process.env.REDIS_PASSWORD,
  },
  PORT: process.env.PORT,
  COOKIE_NAME: `${process.env.COOKIE_NAME}${process.env.NODE_ENV === 'production' ? 'Prod' : 'Test'}`,
  security: {
    session: {
      SESSION_TOKEN: process.env.SESSION_SECRET,
    },
    cookie: {
      COOKIE_TOKEN: process.env.COOKIE_SECRET,
    },
    password: {
      saltlen: 512,
      keylen: 512,
      iterations: 100000,
      digest: 'sha512',
    },
  },
  stripeENV: {
    KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK: process.env.STRIPE_SECRET_WEBHOOK,
  },
  proxy: {
    SERVER: process.env.PROXY_SERVER,
    USERNAME: process.env.PROXY_USERNAME,
    PASSWORD: process.env.PROXY_PASSWORD,
    v2: {
      SERVER: process.env.PROXY_V2_SERVER,
      USERNAME: process.env.PROXY_V2_USERNAME,
      PASSWORD: process.env.PROXY_V2_PASSWORD,
    },
    IP: process.env.IP,
  },
  apiKey: {
    EMAILKEY: process.env.EMAIL_KEY,
    BREVOKEY: process.env.BREVOKEY,
    CAPTCHA_KEY: process.env.RECAPTCHA_SECRET_KEY,
    GPT_KEY: process.env.GPT_KEY,
    SIGNAL_HIRE: process.env.SIGNAL_HIRE_KEYS?.split(','),
  },
  mailer: {
    DIR: process.env.MAILER_DIR,
    USER: process.env.MAILER_USER,
    PASSWORD: process.env.MAILER_PASSWORD,
    PORT: process.env.MAILER_PORT,
    HOST: process.env.MAILER_HOST,
  },
  oAuth: {
    clientID: process.env.GOOGLE_CLIENT_ID,
  },
  log: {
    FORMAT: process.env.LOG_FORMAT,
    DIR: process.env.LOG_DIR,
  },
  NODE_ENV: process.env.NODE_ENV,
  sites: {
    LinkedIn: process.env.LINKEDIN,
    Viadeo: process.env.VIADEO,
    Xing: process.env.XING,
    Batiactu: process.env.BATIACTU,
    Dribble: process.env.DRIBBLE,
    Behance: process.env.BEHANCE,
    'Culinary agents': process.env.CULINARY_AGENTS,
    Symfony: process.env.SYMFONY,
    HEC: process.env.HEC,
    Polytechnique: process.env.POLYTECHNIQUE,
    Ferrandi: process.env.FERRANDI,
    UTC: process.env.UTC,
    'Centrale Supélec': process.env.CENTRALE_SUPELEC,
    'Centrale Lille': process.env.CENTRALE_LILLE,
    Essec: process.env.ESSEC,
    Neoma: process.env.NEOMA,
  },
  EXECUTABLE_PATH: process.env.NODE_ENV !== 'production' ? executablePath() : process.env.EXECUTABLE_PATH,
};

export default config;
