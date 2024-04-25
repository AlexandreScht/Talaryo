import { Knex } from 'knex';

module.exports.up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('users', table => {
    table.bigIncrements('id').unsigned().primary();
    table.string('email', 125).notNullable();
    table.text('password').nullable();
    table.enu('role', ['admin', 'business', 'pro', 'free']).defaultTo('free');
    table.string('firstName', 125).nullable();
    table.string('lastName', 125).nullable();
    table.string('society', 125).nullable();
    table.boolean('validate').notNullable().defaultTo(false);
    table.boolean('passwordReset').notNullable().defaultTo(false);
    table.string('accessToken', 125).nullable();
    table.string('refreshToken', 125).nullable();
    table.string('stripeCustomer', 64).nullable();
    table.enu('subscribe_status', ['active', 'waiting', 'pending', 'disable']).defaultTo('disable');
    table.timestamp('subscribe_start').nullable();
    table.timestamp('subscribe_end').nullable();
    table.timestamps(true, true, true);
  });
  await knex.schema.createTable('scores', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.tinyint('year');
    table.tinyint('month');
    table.tinyint('day');
    table.integer('searches').notNullable().defaultTo(0);
    table.integer('profils').notNullable().defaultTo(0);
    table.integer('mails').notNullable().defaultTo(0);
    table.timestamps(true, true, true);
    table.unique(['userId', 'year', 'month', 'day']);
  });
  await knex.schema.createTable('favFolders', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.text('name').notNullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'name']);
  });
  await knex.schema.createTable('favoris', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.integer('favFolderId').notNullable().references('id').inTable('favFolders');
    table.text('link').notNullable();
    table.text('img').notNullable();
    table.text('email').nullable();
    table.boolean('locked').notNullable().defaultTo(false);
    table.string('fullName', 255).nullable();
    table.string('currentJob', 255).nullable();
    table.string('currentCompany', 255).nullable();
    table.text('desc').nullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'link', 'favFolderId']);
  });
  await knex.schema.createTable('event', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.string('eventName', 255).notNullable();
    table.text('value').nullable();
    table.string('text', 255).nullable();
    table.string('date', 255).notNullable();
    table.string('eventId', 255).notNullable();
    table.boolean('send').notNullable().defaultTo(false);
    table.timestamps(true, true, true);
    table.unique(['userId', 'eventName', 'date']);
  });
  await knex.schema.createTable('searchFolders', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.string('name').notNullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'name']);
  });
  await knex.schema.createTable('searches', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.integer('searchFolderId').notNullable().references('id').inTable('searchFolders');
    table.text('searchQueries').notNullable();
    table.string('name').notNullable();
    table.boolean('locked').notNullable().defaultTo(false);
    table.string('society').nullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'name', 'searchFolderId']);
  });
};

module.exports.down = async (knex: Knex): Promise<void> => {
  const tables = ['event', 'favoris', 'favFolders', 'searches', 'searchFolders', 'scores', 'users'];

  for (const table of tables) {
    const exists = await knex.schema.hasTable(table);
    if (exists) {
      await knex.schema.dropTable(table);
    }
  }
};
