export const girls = [
  'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczNja0GfJi5IUXxWyemWGo1aO3kf7s7ISNrIV1Zk1sKkHVz41Vm4nQgtfAg8FY_5YkzCcv2czPvvAtJaDNtX-fu6o7IpItLDrhrkpL-5ftEEvsniouBVaRS8L8jNkDjhwawSyj9eWlnnDn_UU2AHjJxe=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczNsthloyHoW1cV39SpsUlBYefwPxD5LhmfgHfWwO_tGjj4gBTkrh3HohDkbMcMLUa0o1VMKEuIJFW9XNg_jpo_B7SFHyqVzPrnU9akTFlUUmS_awvaD2FHKrWErDjL0KPoWik6_frHvSIs96YCTQ4n9=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczN7tvO_Zst7Oh-VR5Fq0iS0K2y7WeqqCqKFLua80treguLJuQogi1P6LqQaF3NCtn7LwKET_paYUgpsKi3_TLKOtGjDPPci-Ja6qrUnSixOYtfN0WX_Shh72LLggI3KuHkwJ-vG3pZbH7jV5XnQbwvz=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczO94B4s5TptbwxRo7Efrn-0wsZ-0eiXkjUzJKy6eaBBhqi-7S_HzTwRZJrSObX3nPZAxF4lqfIJjG3lF-7IR1emmVMGe2_Nexti3TD_mms6qs8kCbwdJlFXTbNCQujbkIncLgzp9BEV9jCGNcY3BMEF=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczNyNyr0AwtUl8W0HDseW0ReQr5yVzF40YKvoNuK27dfVCj-OCjRkk_c0gM8AbU1sugMa908qCNwoas55xrwo5cd5HrkpJxu51CJKOY8VCA-kBGaRz6LkZPxQ0v1vGNNBYtMPL8PksOpUjRZs9Szk8cM=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczM2MN_M9hKUSQ7jD6t2fL7TXNbUx95WekhU1NIf2vlf3JdAsfrBmiL-dFBmkTza6ludJgw2FHKa29ju45IQ3ST4Wv6YkfGlj9H6EGzo4tH_lnQ07OQlrWS3r6vwCs3U-7i9fpqBfWQQIkn4ZE9XC9SZ=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczP2VrwhB4Qf7m_3ozGhVSLE7XGd66vyERMBMzZRVyYSB3juaEp368IVYWje5TQkA7_X_VgXp7_SH3eZXgBQbavcoHDNfhJitmUKq3j5CtzFQs1X4PbieQX7Skib4X_zvb1xrzRhUdeP8wiZUY1rBZaT=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczNICZUofVyacmexbolZqaE0K8MoX26URCzGVqlAddfhcd6a_DwGGmYOn5-sDk2AbVNDsRzg9zT6gOURAa1ujo30HleaxhWwV2ENlOiB7T0A-kWt_D0f2YQrN1X9fqv53JMdr5KP52Y9IAw7zaxO2FMK=w919-h919-s-no-gm?authuser=1',
  'https://lh3.googleusercontent.com/pw/AP1GczOmgpvO673Lhj8baooI1t56w7--0V2EeDkJpK9anjy5SMt_068_PZMQEr7YvKAIU0SVsTEyZ1xlADN6cV1Wa9axhoyDMFmZ2ATmkrRtyfHePwdhy2xv5FOXL-bpfH_19J6vkOwbNqKsBo33FdEMjVVG=w919-h919-s-no-gm?authuser=1',
];
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
    table.text('name').notNullable();
    table.boolean('deleted').notNullable().defaultTo(false);
    table.timestamps(true, true, true);
  });
  await knex.schema.createTable('favoris', table => {
    table.bigIncrements('id').unsigned().primary();
    table.integer('userId').notNullable().references('id').inTable('users');
    table.integer('favFolderId').notNullable().references('id').inTable('favFolders');
    table.text('link').notNullable();
    table.text('img').notNullable();
    table.text('email').nullable();
    table.boolean('locked').notNullable().defaultTo(false);
    table.boolean('deleted').notNullable().defaultTo(false);
    table.string('fullName', 255).nullable();
    table.string('currentJob', 255).nullable();
    table.string('currentCompany', 255).nullable();
    table.text('desc').nullable();
    table.timestamps(true, true, true);
  });

  // Inserts seed entries
  await knex('favFolders').insert(generate(5, { userId: 1, name: () => faker.word.words(1) }));
  await knex('favoris').insert(
    generate(11, {
      userId: 1,
      link: () => faker.internet.url({ protocol: 'http', appendSlash: true }),
      img: [() => girls[Math.floor(Math.random() * girls.length)]],
      favFolderId: 1,
      fullName: [() => faker.person.fullName()],
      currentJob: [() => faker.person.jobTitle()],
      currentCompany: [() => faker.company.name()],
      desc: [() => faker.person.jobDescriptor()],
    }),
  );
}
