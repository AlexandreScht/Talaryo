import config from './src/config';
const { db } = config;

const knexfile = {
  client: 'pg',
  connection: {
    charset: 'utf8',
    timezone: 'UTC',
    host: db.DB_HOST,
    port: db.DB_PORT,
    user: db.DB_USER,
    password: db.DB_PASSWORD,
    database: db.DB_DATABASE,
  },
  migrations: {
    directory: 'src/database/migrations',
    tableName: 'migrations',
    // stub: 'src/database/stubs',
  },
  seeds: {
    directory: 'src/database/seeds',
    // stub: 'src/database/stubs',
  },
};

module.exports = knexfile;
