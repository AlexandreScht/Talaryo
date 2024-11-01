import App from './src/app';
let app: App;

beforeAll(async () => {
  try {
    app = new App();
    await app.initialize();
    const db = app.knexDb;
    global.app = app.listen();

    await db.migrate.rollback({ database: 'jest', directory: 'src/database/migrations', tableName: 'migrations' }, true);
    await db.migrate.latest({ database: 'jest', directory: 'src/database/migrations', tableName: 'migrations' });
    await db.seed.run({ directory: 'src/database/seeds', specific: 'jest.ts' });
  } catch (error) {
    console.log(error);
  }
});

afterAll(async () => {
  const db = app.knexDb;
  await db.destroy();
  await global.app.close();
});
