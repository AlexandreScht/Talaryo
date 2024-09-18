import config from './src/config';
const {
  db: { pg },
} = config;

const knexfile = {
  client: 'pg',
  connection: {
    charset: 'utf8',
    timezone: 'UTC',
    host: pg.DB_HOST,
    port: pg.DB_PORT,
    user: pg.DB_USER,
    password: pg.DB_PASSWORD,
    database: pg.DB_DATABASE,
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
