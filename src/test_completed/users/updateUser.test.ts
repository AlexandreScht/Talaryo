import { QueryCriteria } from '@/interfaces/service';
import { TokenUser } from '@/interfaces/token';
import { UserModel, UserShape } from '@/models/pg/users';
import ApiServiceFile from '@/services/api';
import UserServiceFile from '@/services/users';
import request from 'supertest';
import Container from 'typedi';
import { authCookie } from '../utils/cookie';

describe('PATCH users/update/:user', () => {
  const updateUserRequest = (params: string, auth?: TokenUser) => {
    const agent = params ? request(global.app).patch(`/api/users/update/${params}`) : request(global.app).patch('/api/users/update');
    if (auth) {
      const authCookieValue = authCookie(auth);
      return agent.set('Cookie', authCookieValue);
    }
    return agent;
  };

  const UserService = Container.get(UserServiceFile);
  const ApiService = Container.get(ApiServiceFile);

  let updateUsers: jest.SpyInstance<
    Promise<boolean | UserModel>,
    [criteria: QueryCriteria<UserShape>, values: Partial<Omit<UserShape, 'id' | 'email'>>, returnValues?: (keyof UserModel)[]],
    any
  >;
  let updateBrevoUser: jest.SpyInstance<
    Promise<void>,
    [{ email: string; firstName?: string; society?: string; lastName?: string; tags?: number[]; removeTags?: number[] }],
    any
  >;

  beforeEach(() => {
    updateUsers = jest.spyOn(UserService, 'updateUsers');
    updateBrevoUser = jest.spyOn(ApiService, 'UpdateBrevoUser');
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await UserService.updateUsers({ id: 12 }, { firstName: 'Alexandre', lastName: 'Scht', society: 'public', role: 'free' });
  });

  //; without auth cookie
  it('without auth cookie => 999 error (Auth required)', async () => {
    const response = await updateUserRequest('12');

    expect(response.status).toBe(999);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Session expired');
  });

  //; without admin account
  it("without admin account => 403 error ( Requiert les droits d'un compte administrateur )", async () => {
    const response = await updateUserRequest('12', { refreshToken: 'letockencibler', sessionId: 2, sessionRole: 'free' });
    expect(response.status).toBe(403);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe("Requiert les droits d'un compte administrateur.");
  });

  //; Without values
  it('Without values => 422 error ( invalid key type )', async () => {
    const response = await updateUserRequest('12', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'admin' });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Une valeur au minimum est requise !');
  });

  //; With incorrect values
  it('With incorrect values => 422 error (Invalid type keys)', async () => {
    const response = await updateUserRequest('12', { refreshToken: 'refreshToken', sessionId: 1, sessionRole: 'admin' }).send({
      firstName: 1478,
      society: true,
      lastName: ['oui'],
      role: 'operateur',
    });

    expect(response.status).toBe(422);
    expect(updateUsers).not.toHaveBeenCalled();
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe(
      "Invalid type for keys: body.role: Invalid enum value. Expected 'admin' | 'business' | 'pro' | 'free', received 'operateur' - body.firstName: Expected string, received number - body.lastName: Expected string, received array - body.society: Expected string, received boolean",
    );
  });

  //; Update user with incorrect id
  it('Update user with incorrect id => 422 error ( Aucun utilisateur trouvé avec id: userId )', async () => {
    const response = await updateUserRequest('48', { refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'admin' }).send({
      firstName: 'Ir0ws',
    });

    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: '48',
      },
      { firstName: 'Ir0ws' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );

    expect(response.status).toBe(422);
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Aucun utilisateur trouvé avec id: 48');
  });

  //; Update user with incorrect email
  it('Update user with incorrect email =>422 error ( Aucun utilisateur trouvé avec le mail: userMail )', async () => {
    const response = await updateUserRequest('usrWithAnImaginaryEmailUser@gmail.com', {
      refreshToken: 'fakeRefreshToken',
      sessionId: 1,
      sessionRole: 'admin',
    }).send({
      firstName: 'Ir0ws',
    });

    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        email: 'usrWithAnImaginaryEmailUser@gmail.com',
      },
      { firstName: 'Ir0ws' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );

    expect(response.status).toBe(422);
    expect(updateBrevoUser).not.toHaveBeenCalled();
    expect(response.body.error).toBe('Aucun utilisateur trouvé avec le mail: usrWithAnImaginaryEmailUser@gmail.com');
  });

  //; Update user by id
  it('Update user by id => 201 status', async () => {
    const response = await updateUserRequest('12', { refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'admin' }).send({
      firstName: 'Ir0ws',
    });

    expect(response.status).toBe(201);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        id: '12',
      },
      { firstName: 'Ir0ws' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.firstName).toBe('Ir0ws');
    expect(updateUser.lastName).toBe('Scht');
    expect(updateUser.society).toBe('public');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, { email: 'updateUser@gmail.com', firstName: 'Ir0ws', lastName: 'Scht', society: 'public' });
  });

  //; Update user by email
  it('Update user by email => 201 status', async () => {
    const response = await updateUserRequest('updateUser@gmail.com', { refreshToken: 'fakeRefreshToken', sessionId: 1, sessionRole: 'admin' }).send({
      firstName: 'Ir0ws',
    });

    expect(response.status).toBe(201);
    expect(updateUsers).toHaveBeenNthCalledWith(
      1,
      {
        email: 'updateUser@gmail.com',
      },
      { firstName: 'Ir0ws' },
      ['email', 'id', 'firstName', 'lastName', 'society', 'role'],
    );

    const updateUser = await UserService.getUser({ id: 12 });

    expect(updateUser).toBeDefined();
    expect(updateUser.firstName).toBe('Ir0ws');
    expect(updateUser.lastName).toBe('Scht');
    expect(updateUser.society).toBe('public');
    expect(updateBrevoUser).toHaveBeenNthCalledWith(1, { email: 'updateUser@gmail.com', firstName: 'Ir0ws', lastName: 'Scht', society: 'public' });
  });
});
