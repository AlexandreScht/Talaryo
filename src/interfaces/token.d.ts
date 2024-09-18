import type { JwtPayload } from 'jsonwebtoken';

interface TokenUser {
  sessionId: number;
  sessionRole: role;
  refreshToken: string;
}

type DataStoredInToken<T> = JwtPayload & T;

export interface TokenData {
  jwt: string;
  expiresIn: number;
}

interface codeToken {
  id: number;
  accessToken: string;
}

interface TwoFactorAuthenticateToken {
  id: number;
  accessToken: string;
  twoFA: twoFactorType;
}

type cookiesValues<T extends object> = T & {
  expired?: boolean;
};
