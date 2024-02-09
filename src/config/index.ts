import dotenv from 'dotenv';
dotenv.config();

const config = {
  FRONT_URL: process.env.FRONT_URL,
  CREDENTIALS: process.env.CREDENTIALS === 'true',
  db: {
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_DATABASE: process.env.DB_DATABASE,
  },
  PORT: process.env.PORT,
  reCaptcha: process.env.RECAPTCHA_SECRET_KEY,
  security: {
    EXPRESS_IN: '30d', // 4 heures
    jwt: {
      JWT_SECRET: process.env.JWT_SECRET,
    },
    session: {
      SESSION_SECRET: process.env.SESSION_SECRET,
    },
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
    password: {
      saltlen: 512,
      keylen: 512,
      iterations: 100000,
      digest: 'sha512',
      PASSWORD_PEPPER: process.env.PASSWORD_PEPPER,
    },
    O2auth: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      secretClient: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  log: {
    FORMAT: process.env.LOG_FORMAT,
    DIR: process.env.LOG_DIR,
  },
  stripeENV: {
    KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK: process.env.STRIPE_SECRET_WEBHOOK,
  },
  mailer: {
    DIR: process.env.MAILER_DIR,
    USER: process.env.MAILER_USER,
    PASSWORD: process.env.MAILER_PASSWORD,
    PORT: process.env.MAILER_PORT,
    HOST: process.env.MAILER_HOST,
  },
  proxy: {
    SERVER: process.env.PROXY_SERVER,
    USERNAME: process.env.PROXY_USERNAME,
    PASSWORD: process.env.PROXY_PASSWORD,
  },
  sites: {
    LinkedIn: process.env.LINKEDIN,
  },
  ORIGIN: process.env.ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
};

export default config;
