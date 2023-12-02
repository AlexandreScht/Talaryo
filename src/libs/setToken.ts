import { UserModel } from '@/models/users';
import config from '@config';
import type { TokenData } from '@interfaces/auth';
import cookie from 'cookie';
import { SignJWT } from 'jose';
import { sign, type JwtPayload } from 'jsonwebtoken';
import parseDuration from 'parse-duration';

const createToken = async (user: UserModel): Promise<TokenData> => {
  const { email, role, firstName } = user;
  const { security } = config;

  const dataStoredInToken: JwtPayload = { User: { role, firstName, email } };
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

  const dataStoredInToken = { user: { sessionId: id, sessionRole: role, refreshToken } };
  const expiresIn = parseDuration(security.EXPRESS_IN) / 1000;

  return { token: sign(dataStoredInToken, security.session.SESSION_SECRET, { expiresIn }), expiresIn };
};

const createCookie = (user: UserModel, refreshToken: string): string => {
  const { FRONT_URL } = config;

  const values = createSession(user, refreshToken);
  return cookie.serialize('Authorization', values.token, {
    httpOnly: true,
    path: '/',
    domain: new URL(FRONT_URL).hostname,
    maxAge: values.expiresIn,
    secure: process.env.NODE_ENV === 'production',
  });
};

export { createCookie, createToken };
