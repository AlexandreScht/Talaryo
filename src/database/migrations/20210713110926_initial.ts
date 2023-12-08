import { Knex } from 'knex';

module.exports.up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('users', table => {
    table.bigIncrements('id').unsigned().primary();
    table.string('email', 125).notNullable();
    table.text('password').nullable();
    table.enu('role', ['admin', 'business', 'advanced', 'pro', 'test']).nullable().defaultTo(null);
    table.string('firstName', 125).nullable();
    table.string('lastName', 125).nullable();
    table.timestamp('freeTrials').nullable();
    table.boolean('freeTest').notNullable().defaultTo(false);
    table.boolean('validate').notNullable().defaultTo(false);
    table.boolean('passwordReset').notNullable().defaultTo(false);
    table.string('accessToken', 125).nullable();
    table.string('refreshToken', 125).nullable();
    table.string('stripeCustomer', 64).nullable();
    table.timestamp('stripeBilling').nullable();
    table.timestamps(true, true, true);
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
    table.string('fullName', 255).nullable();
    table.string('currentJob', 255).nullable();
    table.string('currentCompany', 255).nullable();
    table.text('desc').nullable();
    table.boolean('disabled').notNullable().defaultTo(false);
    table.timestamps(true, true, true);
    table.unique(['userId', 'link', 'favFolderId']);
  });
  await knex.schema.createTable('searchFolders', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.text('name').notNullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'name']);
  });
  await knex.schema.createTable('searches', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.integer('searchFolderId').notNullable().references('id').inTable('searchFolders');
    table.text('searchQueries').notNullable();
    table.timestamps(true, true, true);
    table.unique(['userId', 'searchQueries', 'searchFolderId']);
  });
};

module.exports.down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('favoris');
  await knex.schema.dropTable('favFolders');
  await knex.schema.dropTable('searches');
  await knex.schema.dropTable('searchFolders');
  await knex.schema.dropTable('users');
};
