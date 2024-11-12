import type { JwtPayload } from 'jsonwebtoken';

type role = 'admin' | 'business' | 'pro' | 'free';
type extendedRole = 'admin' | 'business' | 'pro' | 'free';
type sessionKey = 'firstName' | 'lastName' | 'society';

type abonnement = {
  label: extendedRole;
  value: extendedRole;
};

export interface UserSchema {
  id?: number;
  email: string;
  role: role;
  firstName?: string;
  lastName?: string;
  password?: string;
  validate: boolean;
  society?: string;
  accessToken?: string;
  twoFactorType?: twoFactorType;
  accessCode?: string;
  stripeCustomer?: string | Stripe.Customer | Stripe.DeletedCustomer;
  subscribe_status: 'active' | 'pending' | 'disable' | 'waiting';
  subscribe_start?: Date;
  subscribe_end?: Date;
  passwordReset?: string;
}

export type userPayload = {
  firstName: string;
  email: string;
  role: role;
  createdAt: Date;
  society?: string;
};

type clientPayload = {
  User: userPayload;
} & JwtPayload;

interface tableUser {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface updateSession {
  key: sessionKey;
  label?: string;
  required?: boolean;
}

interface loggedUser {
  secret_key: string;
  reset(): void;
}

interface loginResponse {
  msg: string;
  success: boolean;
}
