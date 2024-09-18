// database file:
import config from '@config';
import Knex from 'knex';
import { Model } from 'objection';

const {
  db: { pg },
} = config;

export const PGdbConnection = async () => {
  const dbConfig = {
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

  try {
    const knex = Knex(dbConfig);
    await knex.raw('SELECT 1+1 AS result');
    Model.knex(knex);
    console.log(`       Connected to the database: ${pg.DB_DATABASE}`);
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données PostgreSQL:', error);
  }
};
