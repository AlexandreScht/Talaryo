import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

type schemaType = Record<string, any>;

const generate = (iteration: number, schema: schemaType): schemaType[] => {
  const generatedValues = {};

  return Array.from({ length: iteration }, () => {
    return Object.keys(schema).reduce((item, key) => {
      let value: any;

      if (typeof schema[key] === 'function') {
        do {
          value = schema[key]();
        } while (generatedValues[key] && generatedValues[key].includes(value));

        if (!generatedValues[key]) {
          generatedValues[key] = [];
        }

        generatedValues[key].push(value);
      } else if (Array.isArray(schema[key])) {
        value = schema[key][0]();
      } else {
        value = schema[key];
      }

      item[key] = value;
      return item;
    }, {} as schemaType);
  });
};

const roles = ['business', 'advanced', 'pro', 'test'];

export async function seed(knex: Knex): Promise<void> {
  // Inserts seed entries
  // await knex('users').insert([
  //   { id: 1, email: 'test@mail.com', password: null, role: 'admin', firstName: 'test', lastName: 'account', freeTrials: null, validate: true },
  // ]);
  await knex('users').insert(
    generate(15, {
      email: [() => faker.internet.email()],
      password: null,
      role: [() => roles[Math.floor(Math.random() * roles.length)]],
      firstName: [() => faker.person.firstName()],
      lastName: [() => faker.person.lastName()],
      freeTrials: null,
      validate: true,
    }),
  );
}
