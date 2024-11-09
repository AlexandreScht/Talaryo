import type { MailerServicesJest, UserServicesJest } from '@/interfaces/jest';
import request from 'supertest';
import { getSignedCookieValue } from '../jest-helpers/cookie';
import mailerMockedService from '../jest-helpers/spy-services/mailer';
import userMockedService from '../jest-helpers/spy-services/users';

describe('PATCH auth/reset-password/:email', () => {
  const askNewPasswordRequest = (params: string) => request(global.app).patch(`/api/auth/reset-password/${params}`);

  let getUser: UserServicesJest['getUser'];
  let presetNewPassword: UserServicesJest['presetNewPassword'];
  let ResetPassword: MailerServicesJest['ResetPassword'];

  beforeEach(() => {
    getUser = userMockedService().getUser;
    presetNewPassword = userMockedService().presetNewPassword;
    ResetPassword = mailerMockedService().ResetPassword.mockResolvedValue();
  });

  afterEach(() => jest.restoreAllMocks());

  //; Not existing user account
  it('Not existing user account => 204 status / no reset_access cookie', async () => {
    const res = await askNewPasswordRequest('notExistingUserAccount@gmail.com');

    const { reset_access } = getSignedCookieValue<{ reset_access: undefined }>(res, 'reset_access');
    expect(reset_access).not.toBeDefined();
    expect(presetNewPassword).not.toHaveBeenCalled();
    expect(ResetPassword).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'notExistingUserAccount@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  //; Not validate user account
  it('Not validate user account => 403 error ( Veuillez valider votre compte par e-mail )', async () => {
    const res = await askNewPasswordRequest('validateAccountTest@gmail.com');

    const { reset_access } = getSignedCookieValue<{ reset_access: undefined }>(res, 'reset_access');
    expect(reset_access).not.toBeDefined();
    expect(presetNewPassword).not.toHaveBeenCalled();
    expect(ResetPassword).not.toHaveBeenCalled();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'validateAccountTest@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Veuillez valider votre compte par e-mail.');
  });

  //; Existing user
  it('Existing user => 201 status / correct reset_access', async () => {
    const res = await askNewPasswordRequest('alexandreschecht@gmail.com');

    const { reset_access } = getSignedCookieValue<{ reset_access: { id: string; accessToken: string } }>(res, 'reset_access');
    expect(reset_access).toBeDefined();
    expect(reset_access).toHaveProperty('id');
    expect(reset_access).toHaveProperty('accessToken');
    expect(reset_access.id).toBe('1');
    expect(reset_access.accessToken).toBeDefined();
    expect(getUser).toHaveBeenNthCalledWith(1, { email: 'alexandreschecht@gmail.com', oAuthAccount: false }, ['id', 'validate']);
    expect(presetNewPassword).toHaveBeenNthCalledWith(1, '1');
    expect(ResetPassword).toHaveBeenNthCalledWith(1, 'alexandreschecht@gmail.com', expect.any(String));
    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
