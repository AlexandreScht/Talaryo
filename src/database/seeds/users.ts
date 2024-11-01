import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('users').insert({
    email: 'alexandreschecht@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'admin',
    firstName: 'Alexandre',
    lastName: 'Scht',
    subscribe_status: 'active',
    stripeCustomer: 'cus_PrhCl2nTEJhznf',
    validate: true,
  });
  await knex('users').insert({
    email: 'notVerifyAccount@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'free',
    firstName: 'user',
    lastName: 'two',
    validate: false,
  });
  await knex('users').insert({
    email: 'providerAccount@gmail.com',
    role: 'free',
    firstName: 'user',
    lastName: 'tree',
    validate: true,
  });
}
