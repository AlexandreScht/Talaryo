import config from '@/config';
import { UserServicesJest } from '@/interfaces/jest';
import { createSessionToken } from '@/utils/token';
import signCookie from 'cookie-signature';
import request from 'supertest';
import userMockedService from '../jest-helpers/spy-services/users';

describe('GET auth/reset-password', () => {
  const resetPasswordRequest = (values: object | false, token?: any) => {
    let agent = request(global.app).patch('/api/auth/reset-password');
    if (values) {
      const sessionToken = createSessionToken<object>(values, '1m');
      const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
      agent = agent.set('Cookie', `reset_access=s:${signedCookieValue}`);
    }
    if (token) {
      agent = agent.set('Authorization', `Bearer ${token}`);
    }
    return agent;
  };

  let updateUsers: UserServicesJest['updateUsers'];

  beforeEach(() => {
    updateUsers = userMockedService().updateUsers;
  });

  afterEach(() => jest.restoreAllMocks());

  //; Without cookie test
  it('Without cookie test => 404 error (no cookie provided)', async () => {
    const response = await resetPasswordRequest(false);

    expect(response.status).toBe(404);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès est introuvable. Veuillez refaire votre demande.");
  });

  //; With fake cookie test
  it("With fake cookie test => 422 error ( Votre code d'accès est incorrect. Veuillez refaire votre demande )", async () => {
    const response = await resetPasswordRequest({ id: null, accessToken: null }, 'resetToken').send({
      password: 'newPassword08!',
      confirm: 'newPassword08!',
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Votre code d'accès est incorrect. Veuillez refaire votre demande.");
  });

  //; Invalid type keys test
  it('Invalid type keys test => 422 error (Invalid type keys)', async () => {
    const response = await resetPasswordRequest({ id: 1, accessToken: 'fakeAccessTocken' }, 'resetToken').send({
      password: 'MyPassword',
      confirm: 'NewPassword',
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      'Invalid type for keys: body.password: Le mot de passe doit contenir au moins 1 lettre majuscule, 1 lettre minuscule et 1 caractère spécial - body.confirm: Les mots de passe doivent être identiques',
    );
  });

  //; without token value
  it('without token value => 422 error ( Votre token est invalide )', async () => {
    const response = await resetPasswordRequest({ id: 1, accessToken: 'fakeAccessTocken' }).send({
      password: 'newPassword08!',
      confirm: 'newPassword08!',
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Votre token est invalide');
  });

  //; With incorrect user
  it('With incorrect user => 505 error ( Impossible de mettre à jour votre mot de passe. Veuillez contacter le support )', async () => {
    const response = await resetPasswordRequest({ id: 48, accessToken: 'MyFakeAccessToken' }, 'resetToken').send({
      password: 'newPassword08!',
      confirm: 'newPassword08!',
    });

    expect(response.status).toBe(505);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 48, accessToken: 'MyFakeAccessToken', password: { not: null }, passwordAccess: 'resetToken' },
      { password: 'newPassword08!', passwordAccess: null },
    );
    expect(response.body.error).toBe('Impossible de mettre à jour votre mot de passe. Veuillez contacter le support.');
  });

  //; reset Password
  it('reset Password => 204 status', async () => {
    updateUsers.mockResolvedValue(true);
    const response = await resetPasswordRequest({ id: 1, accessToken: 'MyFakeAccessToken' }, 'resetToken').send({
      password: 'newPassword08!',
      confirm: 'newPassword08!',
    });

    expect(response.status).toBe(204);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      { id: 1, accessToken: 'MyFakeAccessToken', password: { not: null }, passwordAccess: 'resetToken' },
      { password: 'newPassword08!', passwordAccess: null },
    );
    expect(response.body).toEqual({});
  });
});
