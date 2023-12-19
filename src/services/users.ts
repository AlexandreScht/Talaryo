import { ExpiredSessionError, InvalidCredentialsError, InvalidSessionError, ServicesError } from '@exceptions';
import type { AuthRegister, TokenUser } from '@interfaces/auth';
import { UserModel, UserShape } from '@models/users';
import { hash } from 'bcrypt';
import type { Knex } from 'knex';
import { Transaction } from 'objection';
import { Service } from 'typedi';
import { v4 as uuid } from 'uuid';

@Service()
class UsersServiceFile {
  get getModel(): Knex<any, any[]> {
    return UserModel.knex();
  }

  public async findUserById(id: number): Promise<[boolean, UserModel?]> {
    try {
      const findUser: UserModel = await UserModel.query().findById(id);
      if (!findUser) {
        return [true];
      }
      return [false, findUser];
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async findUserByEmail(email: string): Promise<[boolean, UserModel?]> {
    try {
      const findUser: UserModel = await UserModel.query().findOne({ email });
      if (!findUser) {
        return [true];
      }
      return [false, findUser];
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
        const hashedPassword = await hash(userData.password, 10);
        return await UserModel.query(trx).insert({ ...userData, password: hashedPassword, accessToken: uuid().replace(/-/g, '') });
      }
      return await UserModel.query().insert({ ...userData, validate: true });
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async login(userData: UserModel, password: string): Promise<UserShape> {
    try {
      if (await userData.checkPassword(password)) {
        return userData;
      }
    } catch (error) {
      throw new ServicesError();
    }
    throw new InvalidCredentialsError('Email or Password is incorrect');
  }

  public async setRefreshToken(userData: UserModel, refreshToken: string): Promise<void> {
    try {
      const updatedCount = await UserModel.query().findById(userData.id).update({ refreshToken });
      if (updatedCount) return;
    } catch (error) {
      throw new ServicesError();
    }
    throw new InvalidSessionError();
  }

  public async checkRefreshToken(userData: TokenUser): Promise<void> {
    try {
      const user = await UserModel.query().findById(userData.sessionId).select('refreshToken');

      if (user && user.refreshToken === userData.refreshToken) return;
    } catch (error) {
      throw new ServicesError();
    }
    throw new ExpiredSessionError();
  }

  public async ValidateUserAccount(token: string): Promise<void> {
    try {
      const updatedCount = await UserModel.query().where('accessToken', token).where('validate', false).patch({ validate: true, accessToken: null });

      if (updatedCount) return;
    } catch (error) {
      throw new ServicesError();
    }
    throw new InvalidSessionError();
  }
}

export default UsersServiceFile;
