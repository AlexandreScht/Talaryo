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

export async function seed(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('searches');
  await knex.schema.dropTableIfExists('searchFolders');
  await knex.schema.createTable('searchFolders', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.string('name').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
    table.timestamps(true, true, true);
  });
  await knex.schema.createTable('searches', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.integer('searchFolderId').notNullable().references('id').inTable('searchFolders');
    table.text('searchQueries').notNullable();
    table.string('name').notNullable();
    table.boolean('locked').notNullable().defaultTo(false);
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('society').nullable();
    table.timestamps(true, true, true);
  });
  // Inserts seed entries
  await knex('searchFolders').insert(generate(10, { userId: 1, name: () => faker.word.words(1) }));
  await knex('searches').insert(
    generate(5, {
      userId: 1,
      searchQueries: '{"platform":["LinkedIn"],"fn":"développeur","sector":"informatique","skill":"javascript","time":true}',
      searchFolderId: [() => Math.floor(Math.random() * (10 - 1 + 1)) + 1],
      name: () => faker.word.words(1),
      society: () => faker.word.words(1),
    }),
  );
}
