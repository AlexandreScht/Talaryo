import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasAccessCode = await knex.schema.hasColumn('users', 'accessCode');
  if (!hasAccessCode) {
    await knex.schema.alterTable('users', table => {
      table.string('accessCode', 125).nullable();
    });
  }

  const hasRefreshToken = await knex.schema.hasColumn('users', 'refreshToken');
  if (hasRefreshToken) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('refreshToken');
    });
  }

  const hasTwoFactorType = await knex.schema.hasColumn('users', 'twoFactorType');
  if (!hasTwoFactorType) {
    await knex.schema.alterTable('users', table => {
      table.enu('twoFactorType', ['authenticator', 'email', null]).nullable();
    });
  }

  const hasPasswordReset = await knex.schema.hasColumn('users', 'passwordReset');
  if (hasPasswordReset) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('passwordReset');
    });
  }
  await knex.schema.alterTable('users', table => {
    table.string('passwordReset', 125).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasAccessCode = await knex.schema.hasColumn('users', 'accessCode');
  if (hasAccessCode) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('accessCode');
    });
  }

  const hasRefreshToken = await knex.schema.hasColumn('users', 'refreshToken');
  if (!hasRefreshToken) {
    await knex.schema.alterTable('users', table => {
      table.string('refreshToken', 125).nullable();
    });
  }
  const hasTwoFactorType = await knex.schema.hasColumn('users', 'twoFactorType');
  if (hasTwoFactorType) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('twoFactorType');
    });
  }

  const hasPasswordReset = await knex.schema.hasColumn('users', 'passwordReset');
  if (hasPasswordReset) {
    await knex.schema.alterTable('users', table => {
      table.dropColumn('passwordReset');
    });
  }
}
