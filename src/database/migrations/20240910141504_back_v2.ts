import type { Knex } from 'knex';

const haveColumn = async (table: string, column: string, knex: Knex, handler: () => Promise<void>) => {
  const hasColumn = await knex.schema.hasColumn(table, column);
  if (hasColumn) {
    await handler();
  }
};

const haveNotColumn = async (table: string, column: string, knex: Knex, handler: () => Promise<void>) => {
  const hasColumn = await knex.schema.hasColumn(table, column);
  if (!hasColumn) {
    await handler();
  }
};

export async function up(knex: Knex): Promise<void> {
  haveNotColumn('users', 'accessCode', knex, async () => await knex.schema.alterTable('users', t => t.string('accessCode', 125).nullable()));
  haveColumn('users', 'refreshToken', knex, async () => await knex.schema.alterTable('users', t => t.dropColumn('refreshToken')));
  haveNotColumn(
    'users',
    'twoFactorType',
    knex,
    async () => await knex.schema.alterTable('users', t => t.enu('twoFactorType', ['authenticator', 'email', null]).nullable()),
  );
}

export async function down(knex: Knex): Promise<void> {
  haveColumn('users', 'accessCode', knex, async () => await knex.schema.alterTable('users', t => t.dropColumn('accessCode')));
  haveNotColumn('users', 'refreshToken', knex, async () => await knex.schema.alterTable('users', t => t.string('accessToken', 125).nullable()));
  haveColumn('users', 'twoFactorType', knex, async () => await knex.schema.alterTable('users', t => t.dropColumn('twoFactorType')));
}
