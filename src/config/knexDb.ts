// dbConfig.js

import config from '.';

const {
  db: { pg },
} = config;

const dbConfig =
  config.NODE_ENV === 'test'
    ? {
        client: 'pg',
        connection: {
          charset: 'utf8',
          timezone: 'UTC',
          user: pg.DB_USER,
          password: pg.DB_PASSWORD,
          host: pg.DB_HOST,
          port: pg.DB_PORT,
          database: 'jest',
        },
      }
    : {
        client: 'pg',
        connection: {
          charset: 'utf8',
          timezone: 'UTC',
          user: pg.DB_USER,
          password: pg.DB_PASSWORD,
          host: pg.DB_HOST,
          port: pg.DB_PORT,
          database: pg.DB_DATABASE,
        },
        pool: {
          min: 2,
        },
      };

export default dbConfig;
