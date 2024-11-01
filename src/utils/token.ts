import config from '@config';
import { decode, sign, TokenExpiredError, verify } from 'jsonwebtoken';
import speakeasy from 'speakeasy';

export function createSessionToken<T extends object>(values: T, expiresIn: string | number) {
  const { security } = config;
  return sign(values, security.session.SESSION_TOKEN, { expiresIn });
}

export const decryptSessionToken = <T>(Token: string, allowExpiredToken?: boolean): [boolean | Error, T?] => {
  const { security } = config;
  try {
    const data = verify(Token, security.session.SESSION_TOKEN) as T;
    return [false, data];
  } catch (error) {
    if (error instanceof TokenExpiredError && allowExpiredToken) {
      const decoded = decode(Token) as T | null;
      if (decoded) {
        return [error, decoded];
      }
      return [error];
    }
    return [error];
  }
};

export const verifyAuthenticator2FA = (secret: string, token: string) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });
};
