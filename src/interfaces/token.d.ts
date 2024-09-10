import type { JwtPayload } from 'jsonwebtoken';
import type { role, twoFactorType } from './users';

interface TokenUser {
  sessionId: string;
  sessionRole: role;
  refreshToken: string;
}

type DataStoredInToken<T> = JwtPayload & T;

export interface TokenData {
  jwt: string;
  expiresIn: number;
}

interface codeToken {
  id: string;
  accessToken: string;
}

interface TwoFactorAuthenticateToken {
  id: string;
  accessToken: string;
  twoFA: twoFactorType;
}

type cookiesValues<T extends object> = T & {
  expired?: boolean;
};
