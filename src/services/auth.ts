import { InvalidCredentialsError, ServicesError } from '@/exceptions';
import { UserModel } from '@/models/pg/users';
import { logger } from '@/utils/logger';
import type { registerService, RegisterServiceReturnType } from '@interfaces/service';
import { genSalt, hash } from 'bcrypt';
import { Transaction } from 'objection';
import randomatic from 'randomatic';
import { Service } from 'typedi';
import { v7 as uuid } from 'uuid';

@Service()
export default class AuthServiceFile {
  public async register<T extends registerService>(userData: T, trx: Transaction): Promise<RegisterServiceReturnType<T>> {
    try {
      if ('password' in userData && userData.password) {
        const salt = await genSalt(10);
        const hashedPassword = await hash(userData.password, salt);
        return (await UserModel.query(trx)
          .insert({ ...userData, password: hashedPassword, accessToken: uuid(), accessCode: randomatic('0', 6) })
          .returning(['accessToken', 'accessCode', 'id'])) as RegisterServiceReturnType<T>;
      }
      return (await UserModel.query(trx)
        .insert({ ...userData, validate: true })
        .returning(['email', 'role', 'id', 'createdAt'])) as RegisterServiceReturnType<T>;
    } catch (error) {
      logger.error('AuthServiceFile.register => ', error);
      throw new ServicesError('Une erreur est survenue lors de votre enregistrement');
    }
  }

  public async login(userData: Partial<UserModel>, password: string): Promise<Boolean> {
    if (await userData.checkPassword(password)) {
      return true;
    }
    throw new InvalidCredentialsError('Email ou mot de passe incorrect !');
  }
}
