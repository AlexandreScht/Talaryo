import { User, role } from '@interfaces/models';
import { compare } from 'bcrypt';
import { Model, ModelObject, QueryBuilder } from 'objection';

export class UserModel extends Model implements User {
  id: number;
  email: string;
  role: role;
  password?: string;
  firstName?: string;
  lastName?: string;
  validate: boolean;
  society?: string;
  accessToken?: string;
  refreshToken?: string;
  stripeCustomer?: string;
  stripeBilling?: Date;
  passwordReset?: boolean;
  createdAt: string;
  updatedAt: string;
  count?: string;

  static tableName = 'users';
  static idColumn = 'id';

  static modifiers = {
    paginate: (query: QueryBuilder<UserModel, UserModel[]>, limit: number, page: number) => query.limit(limit).offset((page - 1) * limit),
  };

  checkPassword = async (password: string): Promise<boolean> => {
    return await compare(password, this.password);
  };
}

export type UserShape = ModelObject<UserModel>;
