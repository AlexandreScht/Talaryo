import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.string('passwordAccess', 125).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasRefreshToken = await knex.schema.hasColumn('users', 'passwordReset');
  if (hasRefreshToken) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('passwordReset');
    });
  }
  const hasPasswordReset = await knex.schema.hasColumn('users', 'passwordAccess');
  if (hasPasswordReset) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('passwordAccess');
    });
  }
}
