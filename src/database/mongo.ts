import config from '@/config';
import { logger } from '@/utils/logger';
import { connect, set } from 'mongoose';

const {
  db: {
    mongo: { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER },
  },
  NODE_ENV,
} = config;

export const MongodbConnection = async () => {
  const dbConfig = {
    url: `mongodb://${DB_HOST}:${DB_PORT}`,
    options: {
      dbName: DB_DATABASE,
      user: DB_USER,
      pass: DB_PASSWORD,
    },
  };

  if (NODE_ENV !== 'production') {
    set('debug', true);
  }

  try {
    await connect(dbConfig.url, dbConfig.options);
    console.log(`       Connected to the database: ${DB_DATABASE}`);
  } catch (error) {
    logger.error('Failed to connect to the database', error);
  }
};
