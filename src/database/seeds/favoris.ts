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
  await knex.schema.dropTableIfExists('favoris');
  await knex.schema.dropTableIfExists('favFolders');
  await knex.schema.createTable('favFolders', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.string('name').notNullable();
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
    table.timestamps(true, true, true);
    table.unique(['userId', 'link', 'favFolderId']);
  });

  // Inserts seed entries
  await knex('favFolders').insert(generate(50, { userId: 1, name: () => faker.word.words(1) }));
  await knex('favoris').insert(
    generate(75, {
      userId: 1,
      link: () => faker.internet.url({ protocol: 'http', appendSlash: true }),
      img: [() => faker.internet.avatar()],
      favFolderId: [() => Math.floor(Math.random() * (50 - 1 + 1)) + 1],
      fullName: [() => faker.person.fullName()],
      currentJob: [() => faker.person.jobTitle()],
      currentCompany: [() => faker.company.name()],
      desc: [() => faker.person.jobDescriptor()],
    }),
  );
}
