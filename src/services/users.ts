import { setKeyToken } from '@/utils/keyToken';
import { ExpiredSessionError, InvalidCredentialsError, InvalidSessionError, ServicesError } from '@exceptions';
import type { AuthRegister, TokenUser } from '@interfaces/auth';
import { UserModel, UserShape } from '@models/users';
import { genSalt, hash } from 'bcrypt';
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
      console.log(error);
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
      console.log(error);

      throw new ServicesError();
    }
  }

  public async login(userData: UserModel, password: string): Promise<UserShape> {
    try {
      if (await userData.checkPassword(password)) {
        if (userData.passwordReset) {
          await UserModel.query().findById(userData.id).patch({ passwordReset: false });
        }
        return userData;
      }
      throw new InvalidCredentialsError();
    } catch (error) {
      console.log(error);
      
      throw new ServicesError();
    }
  }

  public async resetPassword(password: string, accessToken: string, id: number | string): Promise<number> {
    try {
      const hashedPassword = await hash(password, 10);
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
      console.log(error);
      
      throw new ServicesError();
    }
  }

  public async checkRefreshToken(userData: TokenUser): Promise<void> {
    try {
      const user = await UserModel.query().findById(userData.sessionId).select('refreshToken');

      if (user && user.refreshToken === userData.refreshToken) return;
      throw new ExpiredSessionError();
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async ValidateUserAccount(token: string): Promise<void> {
    try {
      const updatedCount = await UserModel.query()
        .where('accessToken', token)
        .where('validate', false)
        .patch({ validate: true, accessToken: null, updatedAt: new Date().toISOString() });

      if (updatedCount) return;
      throw new InvalidSessionError();
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default UsersServiceFile;
