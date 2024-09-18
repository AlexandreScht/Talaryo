import dotenv from 'dotenv';
dotenv.config();

const config = {
  CREDENTIALS: process.env.CREDENTIALS === 'true',
  ORIGIN: process.env.ORIGIN,
  BASEURL: 'http://localhost:3005/api',
  CAPTCHA_KEY: process.env.RECAPTCHA_SECRET_KEY,
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
    client: {
      CLIENT_TOKEN: process.env.JWT_SECRET,
    },
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
      PASSWORD_PEPPER: process.env.PASSWORD_PEPPER,
    },
    TWO_FA: process.env.TWO_FACTOR_AUTHENTICATOR,
  },
  apiKey: {
    EMAILKEY: process.env.EMAIL_KEY,
    BREVOKEY: process.env.BREVOKEY,
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
  allowedIp: process.env.ALLOWED_IP.split(','),
  log: {
    FORMAT: process.env.LOG_FORMAT,
    DIR: process.env.LOG_DIR,
  },
  NODE_ENV: process.env.NODE_ENV,
};

export default config;
