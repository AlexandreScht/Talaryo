import type { role } from '@interfaces/models';
import type { TokenPayload } from 'google-auth-library';
import { JwtPayload } from 'jsonwebtoken';

export interface TokenData {
  jwt: string;
  expiresIn: number;
}

export interface TokenUser {
  sessionId: number;
  sessionRole: role;
  refreshToken: string;
}

export type DataStoredInToken = {
  user?: {
    sessionId: string;
    sessionRole: role;
    refreshToken: string;
  };
} & JwtPayload;

export interface AuthRegister {
  email: string;
  role?: role;
  password?: string;
  token?: string;
  firstName?: string;
  lastName?: string;
}

export type OAuthToken = [boolean, TokenPayload?];
