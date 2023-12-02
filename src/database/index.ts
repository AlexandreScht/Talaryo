import config from '@config';
import Knex from 'knex';
import { Model } from 'objection';

const { db } = config;

export const dbConnection = async () => {
  const dbConfig = {
    client: 'pg',
    connection: {
      charset: 'utf8',
      timezone: 'UTC',
      user: db.DB_USER,
      password: db.DB_PASSWORD,
      host: db.DB_HOST,
      port: db.DB_PORT,
      database: db.DB_DATABASE,
    },
    pool: {
      min: 2,
      max: 10,
    },
  };

  await Model.knex(Knex(dbConfig));
};
