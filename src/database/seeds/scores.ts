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
  await knex.schema.dropTableIfExists('scores');

  await knex.schema.createTable('scores', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.tinyint('year');
    table.tinyint('month');
    table.tinyint('day');
    table.integer('searches').notNullable().defaultTo(0);
    table.integer('profils').notNullable().defaultTo(0);
    table.integer('mails').notNullable().defaultTo(0);
    table.timestamps(true, true, true);
    // table.unique(['userId', 'year', 'month', 'day']);
  });

  await knex('scores').insert(
    generate(75, {
      userId: 1,
      year: [() => Math.floor(Math.random() * (2024 - 2015 + 1)) + 2015],
      month: [() => Math.floor(Math.random() * (12 - 1 + 1)) + 1],
      day: [() => Math.floor(Math.random() * (31 - 1 + 1)) + 1],
      searches: [() => Math.floor(Math.random() * (50 - 1 + 1)) + 1],
      profils: [() => Math.floor(Math.random() * (50 - 1 + 1)) + 1],
      mails: [() => Math.floor(Math.random() * (50 - 1 + 1)) + 1],
    }),
  );
}
