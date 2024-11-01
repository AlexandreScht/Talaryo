import dbConfig from '@/config/knexDb';
import Knex from 'knex';
import { Model } from 'objection';

export const PGdbConnection = async () => {
  try {
    const knex = Knex(dbConfig);
    await knex.raw('SELECT 1+1 AS result');
    Model.knex(knex);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`       Connected to the database: ${dbConfig.connection.database}`);
    }
    return knex;
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données PostgreSQL:', error);
  }
};
