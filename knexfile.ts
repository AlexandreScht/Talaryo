import dbConfig from './src/config/knexDb';

const knexfile = {
  ...dbConfig,
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
