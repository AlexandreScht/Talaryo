import { InvalidArgumentError, ServerException, ServicesError } from '@/exceptions';
import { QueryCriteria, returnUpdateCode, UserServiceFileType } from '@/interfaces/service';
import { UserModel, UserShape } from '@/models/pg/users';
import { logger } from '@/utils/logger';
import { Knex } from 'knex';
import { Page, QueryBuilder } from 'objection';
import randomatic from 'randomatic';
import { Service } from 'typedi';
import { v7 as uuid } from 'uuid';
@Service()
export default class UserServiceFile implements UserServiceFileType {
  //? for transition
  get getModel(): Knex<any, any[]> {
    return UserModel.knex();
  }
  public async getUser(userData: FindUserProps, fields?: (keyof Partial<UserShape>)[]) {
    try {
      let query: QueryBuilder<UserModel, UserModel> | null = null;
      const selectedFields = fields?.length ? fields : ['email', 'id', 'firstName', 'lastName', 'role', 'society', 'subscribe_status'];

      if ('email' in userData) {
        const { email, oAuthAccount } = userData;
        query = UserModel.query()
          .where('email', email)
          .modify(qb => {
            if (oAuthAccount) {
              qb.whereNull('password');
            } else {
              qb.whereNotNull('password');
            }
          })
          .select(selectedFields)
          .first();
      }
      if ('id' in userData) {
        const { id } = userData;
        query = UserModel.query().select(selectedFields).findById(id);
      }
      if (!query) {
        throw new InvalidArgumentError('Search criteria must be either email or id');
      }
      return await query;
    } catch (error) {
      console.log(error);

      logger.error(error);
      throw new ServicesError();
    }
  }

  public async updateUsers(
    criteria: QueryCriteria<UserShape>,
    values: Partial<Omit<UserShape, 'id' | 'email'>>,
    returnValues?: (keyof Partial<UserModel>)[],
  ) {
    try {
      const query = UserModel.query()
        .modify(qb => {
          Object.entries(criteria).forEach(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([operator, val]) => {
                switch (operator) {
                  case 'not':
                    Array.isArray(val) ? qb.whereNotIn(key, val) : qb.whereNot({ [key]: val });
                    break;
                  case 'are':
                    Array.isArray(val) ? qb.whereIn(key, val) : qb.andWhere({ [key]: val });
                    break;
                  default:
                    throw new Error(`Unsupported operator: ${operator}`);
                }
              });
            } else {
              qb.andWhere(key as keyof UserShape, value as keyof UserModel);
            }
          });
        })
        .patch(values);

      return returnValues?.length ? await query.returning(returnValues as string[]).first() : await query.then(result => result > 0);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async findUsers({
    criteria = {},
    pagination = { page: 1, limit: 10 },
    returning,
  }: {
    criteria?: QueryCriteria<UserShape>;
    pagination?: { page: number; limit: number };
    returning?: (keyof UserShape)[];
  } = {}): Promise<Page<UserModel>> {
    try {
      const selectedFields = returning?.length ? returning : ['email', 'id', 'firstName', 'lastName', 'role', 'society', 'subscribe_status'];
      return await UserModel.query()
        .modify(qb => {
          if (Object.keys(criteria).length) {
            Object.entries(criteria).forEach(([key, value]: [keyof UserShape, any]) => {
              if (typeof value === 'object' && value !== null) {
                Object.entries(value).forEach(([operator, val]) => {
                  switch (operator) {
                    case 'not':
                      Array.isArray(val) ? qb.whereNotIn(key, val) : qb.whereNot({ [key]: val });
                      break;
                    case 'are':
                      Array.isArray(val) ? qb.whereIn(key, val) : qb.andWhere({ [key]: val });
                      break;
                    default:
                      throw new Error(`Unsupported operator: ${operator}`);
                  }
                });
              } else if (value) {
                qb.andWhere(key as keyof UserShape, value as keyof UserModel);
              }
            });
          }
        })
        .select(selectedFields)
        .page(pagination.page - 1, pagination.limit);
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async deleteUser(userData: FindUserProps): Promise<boolean> {
    try {
      if ('email' in userData) {
        const { email, oAuthAccount } = userData;
        return await UserModel.query()
          .where('email', email)
          .modify(qb => {
            if (oAuthAccount) {
              qb.whereNull('password');
            } else {
              qb.whereNotNull('password');
            }
          })
          .del()
          .then(result => result > 0);
      }
      if ('id' in userData) {
        const { id } = userData;
        return UserModel.query()
          .deleteById(id)
          .then(result => result > 0);
      }

      throw new InvalidArgumentError('Search criteria must be either email or id');
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async generateTokenAccess(id: number): Promise<returnUpdateCode> {
    try {
      const updatedUser = await UserModel.query().patchAndFetchById(id, { accessToken: uuid() }).select('accessToken');

      if (updatedUser) {
        return updatedUser as returnUpdateCode;
      }

      throw new ServerException();
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async presetNewPassword(id: number): Promise<Pick<UserShape, 'accessToken' | 'passwordReset'>> {
    try {
      const updatedUser = await UserModel.query()
        .patchAndFetchById(id, { accessToken: uuid(), passwordReset: uuid() })
        .select('accessToken', 'passwordReset');

      if (updatedUser) {
        return updatedUser as returnUpdateCode;
      }

      throw new ServerException();
    } catch (error) {
      logger.error('UserServiceFile.presetNewPassword', error);
      throw new ServicesError();
    }
  }

  public async generateCodeAccess(id: number, digit = 4, secure = false): Promise<returnUpdateCode> {
    try {
      const updatedUser = await UserModel.query()
        .patchAndFetchById(id, {
          ...(secure ? {} : { accessToken: uuid() }),
          accessCode: randomatic('0', digit),
        })
        .select('accessCode', 'accessToken', 'email', 'firstName');

      if (updatedUser) return updatedUser as returnUpdateCode;

      throw new ServerException();
    } catch (error) {
      console.log(error);

      logger.error(error);
      throw new ServicesError();
    }
  }
}
