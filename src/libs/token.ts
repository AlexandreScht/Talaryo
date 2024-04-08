import { UserModel } from '@/models/users';
import config from '@config';
import type { DataStoredInToken, TokenData, TokenUser } from '@interfaces/auth';
import cookie from 'cookie';
import { SignJWT } from 'jose';
import { sign, verify, type JwtPayload } from 'jsonwebtoken';
import parseDuration from 'parse-duration';

export const createToken = async (user: UserModel): Promise<TokenData> => {
  const { email, role, firstName, lastName, society } = user;
  const { security } = config;

  const dataStoredInToken: JwtPayload = { User: { role, firstName, email, lastName, society } };
  const expiresIn = parseDuration(security.EXPRESS_IN) / 1000; // convert string in secondes
  const token = await new SignJWT(dataStoredInToken)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(security.EXPRESS_IN)
    .sign(new TextEncoder().encode(security.jwt.JWT_SECRET));

  return { expiresIn, jwt: token };
};

const createSession = (user: UserModel, refreshToken: string): { token: string; expiresIn: number } => {
  const { id, role } = user;
  const { security } = config;

  const dataStoredInToken: DataStoredInToken = { user: { sessionId: id.toString(), sessionRole: role, refreshToken } };
  const expiresIn = parseDuration(security.EXPRESS_IN) / 1000;

  return { token: sign(dataStoredInToken, security.session.SESSION_SECRET, { expiresIn }), expiresIn };
};

export const createCookie = (user: UserModel, refreshToken: string): string => {
  const { ORIGIN, NODE_ENV, COOKIE_NAME } = config;

  const values = createSession(user, refreshToken);
  return cookie.serialize(COOKIE_NAME, values.token, {
    httpOnly: true,
    path: '/',
    domain: new URL(ORIGIN).hostname === 'localhost' ? 'localhost' : '.talaryo.com',
    maxAge: values.expiresIn,
    secure: NODE_ENV === 'production' && new URL(ORIGIN).hostname !== 'localhost',
  });
};

export const refreshCookie = (user: UserModel): string => {
  const { ORIGIN, NODE_ENV, COOKIE_NAME } = config;

  const values = createSession(user, user.refreshToken);
  return cookie.serialize(COOKIE_NAME, values.token, {
    httpOnly: true,
    path: '/',
    domain: new URL(ORIGIN).hostname === 'localhost' ? 'localhost' : '.talaryo.com',
    maxAge: values.expiresIn,
    secure: NODE_ENV === 'production' && new URL(ORIGIN).hostname !== 'localhost',
  });
};

export const decryptUserToken = (Authorization: string): [boolean | Error, TokenUser?] => {
  const { security } = config;
  try {
    const data = verify(Authorization, security.session.SESSION_SECRET) as DataStoredInToken;
    const user = {
      ...data.user,
      sessionId: Number.parseInt(data.user.sessionId),
    };
    return [false, user];
  } catch (error) {
    return [error];
  }
};

export const verifyToken = (token: string): boolean => {
  const { security } = config;
  try {
    verify(token, security.jwt.JWT_SECRET);
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token :', error);
    return false;
  }
};
