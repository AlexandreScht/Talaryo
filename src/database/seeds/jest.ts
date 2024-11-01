import { Knex } from 'knex';

function yesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return { year: yesterday.getFullYear(), month: yesterday.getMonth() + 1, day: yesterday.getDate() };
}

function lastMonth() {
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(now.getMonth() - 1);
  lastMonth.setDate(lastMonth.getDate() - 1);
  return { year: lastMonth.getFullYear(), month: lastMonth.getMonth() + 1, day: lastMonth.getDate() };
}

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
    email: 'askCodeAccount@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'free',
    firstName: 'user',
    lastName: 'two',
    accessToken: 'MyFakeAccessToken',
    validate: false,
  });
  await knex('users').insert({
    email: 'validateAccountTest@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'free',
    firstName: 'user',
    lastName: 'two',
    accessToken: 'MyAccessToken',
    accessCode: '4848',
    validate: false,
  });
  await knex('users').insert({
    email: 'providerAccount@gmail.com',
    role: 'free',
    firstName: 'user',
    lastName: 'tree',
    validate: true,
  });
  await knex('users').insert({
    email: 'emailTwoAutenticate@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'admin',
    firstName: 'Alexandre',
    twoFactorType: 'email',
    subscribe_status: 'disable',
    stripeCustomer: 'cus_PrhCl2nTEJhznf',
    lastName: 'Scht',
    validate: true,
  });
  await knex('users').insert({
    email: 'autenticathorTwoAutenticate@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'admin',
    firstName: 'Alexandre',
    twoFactorType: 'authenticator',
    lastName: 'Scht',
    validate: true,
  });
  await knex('users').insert({
    email: 'set2FAmails@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'admin',
    firstName: 'Alexandre',
    accessCode: '2548',
    lastName: 'Scht',
    validate: true,
  });
  await knex('users').insert({
    email: 'set2FAauthenticator@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'admin',
    firstName: 'Alexandre',
    lastName: 'Scht',
    validate: true,
  });
  await knex('users').insert({
    email: 'log2FAmail@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'free',
    firstName: 'Alexandre',
    accessCode: '875680',
    accessToken: 'tuperwayeMail',
    lastName: 'Scht',
    validate: true,
  });
  await knex('users').insert({
    email: 'log2FAauthenticator@gmail.com',
    password: '$2b$10$V5tolw/JvEjK.Z/CFmdihOqsHAilEhLuJb8a6JeYlPur7GvooVshK',
    role: 'free',
    firstName: 'Alexandre',
    lastName: 'Scht',
    accessToken: 'tuperwayeAuth',
    accessCode: 'dfsfsfsdfdsaqa',
    validate: true,
  });
  await knex('users').insert({
    email: 'updateUser@gmail.com',
    role: 'free',
    firstName: 'Alexandre',
    lastName: 'Scht',
    society: 'public',
    validate: true,
  });
  await knex('users').insert({
    email: 'alexandreschecht@gmail.com',
    role: 'free',
    firstName: 'user',
    lastName: 'two',
    validate: false,
  });

  //> favFolder

  await knex('favFolders').insert({
    userId: 1,
    name: 'folderB',
    deleted: true,
  });

  await knex('favFolders').insert({
    userId: 1,
    name: 'maçillteuré',
    deleted: false,
  });

  await knex('favFolders').insert({
    userId: 1,
    name: 'folderC',
    deleted: false,
  });

  await knex('favFolders').insert({
    userId: 1,
    name: 'folderD',
    deleted: false,
  });

  //> favoris

  await knex('favoris').insert({
    userId: 1,
    link: 'https://www.linkedin.com/in/alexandre/',
    img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
    favFolderId: 3,
    fullName: 'alexandre schecht',
    currentJob: 'developpeur web',
    currentCompany: 'microsoft',
    resume: 'developpeur chez microsoft',
    deleted: true,
  });

  await knex('favoris').insert({
    userId: 1,
    link: 'https://www.linkedin.com/in',
    img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
    favFolderId: 3,
    fullName: 'alexandre schecht',
    currentJob: 'developpeur web',
    currentCompany: 'microsoft',
    resume: 'developpeur chez microsoft',
    deleted: false,
  });

  //> searchFolder

  await knex('searchFolders').insert({
    userId: 1,
    name: 'folderB',
    deleted: true,
  });

  await knex('searchFolders').insert({
    userId: 1,
    name: 'maçillteuré',
    deleted: false,
  });

  await knex('searchFolders').insert({
    userId: 1,
    name: 'folderC',
    deleted: false,
  });

  await knex('searchFolders').insert({
    userId: 1,
    name: 'folderD',
    deleted: false,
  });

  //> searches
  await knex('searches').insert({
    userId: 1,
    searchQueries: '{"platform":["LinkedIn"],"fn":"développeur","sector":"informatique","skill":"javascript","time":true}',
    searchFolderId: 3,
    name: 'technologies',
    society: 'openAI',
    deleted: true,
  });

  await knex('searches').insert({
    userId: 1,
    searchQueries: '{"platform":["LinkedIn"],"fn":"agriculteur","sector":"agriculture","skill":"patate","time":true}',
    searchFolderId: 3,
    name: 'culture',
    society: 'lamborder',
    deleted: false,
    isCv: false,
  });

  await knex('searches').insert({
    userId: 1,
    searchQueries: '{"platform":["LinkedIn"],"fn":"vidaeo","sector":"agriculture","skill":"patate","time":true}',
    searchFolderId: 3,
    name: 'monster',
    society: 'redbull',
    deleted: false,
    isCv: true,
  });

  //> scores
  await knex('scores').insert({
    userId: 1,
    ...yesterdayDate(),
    searches: 5,
  });

  await knex('scores').insert({
    userId: 1,
    ...lastMonth(),
    profils: 5,
  });
}
