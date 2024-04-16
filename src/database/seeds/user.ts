import { Knex } from 'knex';

// const roles = ['business', 'advanced', 'pro', 'free'];

export async function seed(knex: Knex): Promise<void> {
  await knex('users').insert({
    email: 'alexandreschecht@gmail.com',
    password: null,
    role: 'admin',
    firstName: 'Alexandre',
    lastName: 'Scht',
    subscribe_status: 'active',
    stripeCustomer: 'cus_PrhCl2nTEJhznf',
    validate: true,
  });
}
