import { role } from '@/interfaces/models';
import { setKeyToken } from '@/utils/keyToken';
import PatchLimit from '@/utils/patchingLimit';
import { ExpiredSessionError, InvalidCredentialsError, InvalidSessionError, ServicesError } from '@exceptions';
import type { AuthRegister } from '@interfaces/auth';
import { UserModel, UserShape } from '@models/users';
import { genSalt, hash } from 'bcrypt';
import type { Knex } from 'knex';
import { Transaction, transaction } from 'objection';
import type Stripe from 'stripe';
import { Service } from 'typedi';
import { v4 as uuid } from 'uuid';
@Service()
class UsersServiceFile {
  get getModel(): Knex<any, any[]> {
    return UserModel.knex();
  }

  public async updateCurrentUser(userData: Partial<UserModel>, id: number): Promise<UserModel> {
    try {
      return await UserModel.query().updateAndFetchById(id, { ...userData });
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async updateUsers(userData: UserModel[]): Promise<boolean> {
    try {
      await transaction(UserModel.knex(), async trx => {
        for (const user of userData) {
          if ('role' in user) {
            new PatchLimit(user);
          }
          await UserModel.query(trx).updateAndFetchById(user.id, user);
        }
      });
      return true;
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async getStripeUser(customer: string | Stripe.Customer | Stripe.DeletedCustomer): Promise<UserModel> {
    try {
      return await UserModel.query().select('firstName', 'email', 'role').where({ stripeCustomer: customer }).first();
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async subscribeUser(
    user: { customer: string | Stripe.Customer | Stripe.DeletedCustomer } | { userId: number },
    data: Partial<UserModel>,
  ): Promise<UserModel> {
    try {
      if ('customer' in user) {
        const userModel = await UserModel.query().where({ stripeCustomer: user.customer }).first();

        if (!userModel) {
          throw new ServicesError('Utilisateur introuvable');
        }
        return await userModel.$query().updateAndFetch(data);
      }
      return await UserModel.query().updateAndFetchById(user.userId, { ...data });
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async findUserById(id: number): Promise<[boolean, UserModel?]> {
    try {
      const findUser: UserModel = await UserModel.query().findById(id);
      return [!!findUser, findUser];
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async findUserByEmail(email: string, onlyRegistered?: boolean): Promise<[boolean, UserModel?]> {
    try {
      let query = UserModel.query().findOne({ email });
      if (onlyRegistered) {
        query = query.whereNotNull('password');
      }
      const findUser: UserModel = await query.clone();

      return [!!findUser, findUser];
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async findUserOAuth(email: string): Promise<[boolean, UserModel?]> {
    try {
      const findUser: UserModel = await UserModel.query().findOne({ email }).whereNull('password');
      if (!findUser) {
        return [true];
      }
      return [false, findUser];
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async register(userData: AuthRegister, trx?: Transaction): Promise<UserModel> {
    try {
      if (userData?.password) {
        const salt = await genSalt(10);
        const hashedPassword = await hash(userData.password, salt);
        return await UserModel.query(trx).insert({ ...userData, password: hashedPassword, accessToken: uuid().replace(/-/g, '') });
      }
      return await UserModel.query().insert({ ...userData, validate: true });
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async askingReset(id: number, trx?: Transaction): Promise<string> {
    try {
      const [accessToken, token] = setKeyToken(id.toString());
      await UserModel.query(trx).findById(id).patch({
        accessToken,
        passwordReset: true,
        updatedAt: new Date().toISOString(),
      });
      return token;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async login(userData: UserModel, password: string): Promise<UserShape> {
    if (await userData.checkPassword(password)) {
      if (userData.passwordReset) {
        await UserModel.query().findById(userData.id).patch({ passwordReset: false });
      }
      return userData;
    }
    throw new InvalidCredentialsError('Les identifiants fournis sont incorrects');
  }

  public async resetPassword(password: string, accessToken: string, id: number | string): Promise<number> {
    try {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      return await UserModel.query()
        .findById(id)
        .where({ accessToken, passwordReset: true })
        .patch({ passwordReset: false, password: hashedPassword, updatedAt: new Date().toISOString() });
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async setRefreshToken(userData: UserModel, refreshToken: string): Promise<void> {
    try {
      const updatedCount = await UserModel.query().findById(userData.id).patch({ refreshToken });
      if (updatedCount) return;
      throw new InvalidSessionError();
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async checkRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const user = await UserModel.query().findById(userId).select('refreshToken');

    if (user && user.refreshToken === refreshToken) return;
    throw new ExpiredSessionError();
  }

  public async getAll({
    firstName,
    lastName,
    email,
    role,
    limit,
    page,
  }: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: role;
    limit: number;
    page: number;
  }): Promise<{ total: number; users: UserModel[] }> {
    try {
      let query = UserModel.query().where({ validate: true });
      if (firstName) {
        query = query.andWhereRaw('LOWER("firstName") LIKE LOWER(?)', [`${firstName}%`]);
      }
      if (lastName) {
        query = query.andWhereRaw('LOWER("lastName") LIKE LOWER(?)', [`${lastName}%`]);
      }
      if (email) {
        query = query.andWhereRaw('LOWER(email) LIKE LOWER(?)', [`${email}%`]);
      }
      if (role) {
        query = query.andWhere({ role });
      }
      const [{ count }] = await query.clone().limit(1).offset(0).count();
      const total = Number.parseInt(count, 10);
      const users = await query.orderBy('id', 'asc').select('id', 'email', 'role', 'firstName', 'lastName').modify('paginate', limit, page);
      return { total, users };
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async ValidateUserAccount(token: string): Promise<void> {
    try {
      const user = await UserModel.query().where({ accessToken: token, validate: false }).first();
      if (!user) {
        throw new InvalidSessionError('Une erreur est survenue lors de la validation de votre compte. Veuillez réessayer plus tard.');
      }
      await UserModel.query().patchAndFetchById(user.id, {
        validate: true,
        accessToken: null,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof InvalidSessionError) {
        throw error;
      }
      throw new ServicesError();
    }
  }
}

export default UsersServiceFile;
