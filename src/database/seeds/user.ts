import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').del();

  // Inserts seed entries
  await knex('users').insert([
    { id: 1, email: 'test@mail.com', password: null, role: 'admin', firstName: 'test', lastName: 'account', freeTrials: null, validate: true },
  ]);
}
