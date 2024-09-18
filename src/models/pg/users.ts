import { UserSchema } from '@/interfaces/models';
import { compare } from 'bcrypt';
import { Model, ModelObject } from 'objection';
import type Stripe from 'stripe';

export class UserModel extends Model implements UserSchema {
  id: number;
  email: string;
  role: role;
  password?: string;
  firstName?: string;
  lastName?: string;
  validate: boolean;
  society?: string;
  accessToken?: string;
  twoFactorType?: twoFactorType;
  accessCode?: string | number;
  stripeCustomer?: string | Stripe.Customer | Stripe.DeletedCustomer;
  subscribe_status: 'active' | 'pending' | 'disable' | 'waiting';
  subscribe_start?: Date;
  subscribe_end?: Date;
  passwordReset?: boolean;
  createdAt: string;
  updatedAt: string;
  count?: string;

  static tableName = 'users';
  static idColumn = 'id';

  static jsonSchema = {
    type: 'object',
    properties: {
      accessCode: {
        type: ['string', 'number', 'null'],
      },
    },
  };

  checkPassword = async (password: string): Promise<boolean> => {
    return await compare(password, this.password);
  };
}

export type UserShape = ModelObject<UserModel> & { checkPassword?: (password: string) => Promise<boolean> };
