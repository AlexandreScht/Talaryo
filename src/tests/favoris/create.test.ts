import type { FavorisServicesJest } from '@/interfaces/jest';
import type { TokenUser } from '@/interfaces/token';
import request from 'supertest';
import { authCookie } from '../jest-helpers/cookie';
import favorisMockedService from '../jest-helpers/spy-services/favoris';

describe('POST favoris/new', () => {
  const createFavRequest = (auth?: TokenUser) => {
    if (auth) {
      const authCookieValue = authCookie(auth);
      return request(global.app).post('/api/favoris/new').set('Cookie', authCookieValue);
    }
    return request(global.app).post('/api/favoris/new');
  };

  let getTotalCount: FavorisServicesJest['getTotalFavorisCount'];
  let create: FavorisServicesJest['create'];

  beforeEach(() => {
    getTotalCount = favorisMockedService().getTotalFavorisCount;
    create = favorisMockedService().create;
  });

  afterEach(() => jest.restoreAllMocks());

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await createFavRequest();

    expect(response.status).toBe(999);
    expect(create).not.toHaveBeenCalled();
    expect(getTotalCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 178,
      pdf: ['dd'],
      resume: 1548,
      img: { data: '' },
      fullName: 5858,
      currentJob: true,
      email: false,
      currentCompany: { data: 'ddd' },
      isFavoris: 'favoris',
    });

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
    expect(getTotalCount).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: body.link: Expected string, received number - body.pdf: Expected string, received array - body.resume: Expected string, received number - body.img: Expected string, received object - body.fullName: Expected string, received number - body.currentJob: Expected string, received boolean - body.email: Expected string, received boolean - body.currentCompany: Expected string, received object - body.favFolderId: Required number - body.isFavoris: Expected boolean, received string',
    );
  });

  //; create a new favoris
  it('create a new favoris => status 201 / favoris ', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'https://www.linkedin.com/in/alexandre-schecht-51a726216/',
      resume: 'un bon petit profils',
      img: 'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
      fullName: 'Alexandre',
      favFolderId: 4,
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        link: 'https://www.linkedin.com/in/alexandre-schecht-51a726216/',
        resume: 'un bon petit profils',
        img: 'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
        fullName: 'Alexandre',
        favFolderId: 4,
      },
      1,
    );
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('3');
  });

  //; create a favoris with wrong folderId
  it('create a favoris with wrong folderId => 422 error ( Echec de la connexion avec la base de donnees )', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      pdf: 'https://www.pdfedin.com/in/alexandre-leboss/',
      img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
      favFolderId: 57,
      fullName: 'alexandre schecht',
      currentJob: 'developpeur web',
      currentCompany: 'microsoft',
      resume: 'developpeur chez microsoft',
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        pdf: 'https://www.pdfedin.com/in/alexandre-leboss/',
        img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
        favFolderId: 57,
        fullName: 'alexandre schecht',
        currentJob: 'developpeur web',
        currentCompany: 'microsoft',
        resume: 'developpeur chez microsoft',
      },
      1,
    );

    expect(response.status).toBe(422);
    expect(response.body.error).toBe("Le dossier assigné au favori n'existe pas.");
  });

  //; create same new favoris
  it('create same new favoris => status 201 / false ', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'https://www.linkedin.com/in/alexandre-schecht-51a726216/',
      resume: 'un bon petit profils',
      img: 'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
      fullName: 'Alexandre',
      favFolderId: 4,
    });

    expect(response.status).toBe(201);
    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        link: 'https://www.linkedin.com/in/alexandre-schecht-51a726216/',
        resume: 'un bon petit profils',
        img: 'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
        fullName: 'Alexandre',
        favFolderId: 4,
      },
      1,
    );

    expect(response.body).toBe(false);
  });

  //; re-create a deleted favoris
  it('re-create a deleted folder => status 201 / favoris', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'https://www.linkedin.com/in/alexandre/',
      img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
      favFolderId: 3,
      fullName: 'alexandre schecht',
      currentJob: 'developpeur web',
      currentCompany: 'microsoft',
      resume: 'developpeur chez microsoft',
    });

    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).toHaveBeenNthCalledWith(
      1,
      {
        link: 'https://www.linkedin.com/in/alexandre/',
        img: 'https://lh3.googleusercontent.com/pw/AP1GczPyYa_GsqTo_7wFQREqB9mSvg30_o2ak867_2ZuZWKgc07uKxj0YMVLLpAgHdU9ZS5jaKOF6EKjqQ2J1W3VW3rQYnzBEjrlX22A_3VLS3zTZvQVQ_hRwwZ5LT2hW2qtvq8dPNduV7M9S83rMjpTfaOX=w919-h919-s-no-gm?authuser=1',
        favFolderId: 3,
        fullName: 'alexandre schecht',
        currentJob: 'developpeur web',
        currentCompany: 'microsoft',
        resume: 'developpeur chez microsoft',
      },
      1,
    );

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.id).toBe('1');
  });

  //; exceed max limit of favoris
  it('exceed max limit of favoris => 605 error ( Vous avez atteint la limite de favoris enregistrés avec votre abonnement ) ', async () => {
    const response = await createFavRequest({ refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'free' }).send({
      link: 'https://www.com/in/alexandre-schecht-51a726216/',
      resume: 'un bon petit profils',
      img: 'https://lh3.googleusercontent.com/pw/AP1GczOLonlps_VxR5pc0ZOyl7m1llrmbifvwdNAyZ8olufwZNZd-Ik3NKqpy5H89UwzBDv0sh2_S5uc8rRxNQku4vKormi04dW4fdJSUJznUr8Hgm2kKWjfz7YA6LgWgNVJpIa02bjTrXrhCOebXeW4tviK=w919-h919-s-no-gm?authuser=1',
      fullName: 'Alexandre',
      favFolderId: 4,
    });

    expect(response.status).toBe(605);
    expect(getTotalCount).toHaveBeenNthCalledWith(1, 1);
    expect(create).not.toHaveBeenCalled();

    expect(response.body.error).toBe('Vous avez atteint la limite de favoris enregistrés avec votre abonnement FREE.');
  });
});
