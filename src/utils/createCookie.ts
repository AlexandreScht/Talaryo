import config from '@/config';
import cookie from 'cookie';
import signCookie from 'cookie-signature';
import type { Response } from 'express';
import { createSessionToken } from './token';

export default function createSessionCookie<T extends object>(res: Response, values: T & { cookieName: string }, timer: string = '15m'): void {
  const { cookieName, ...other } = values;
  const sessionToken = createSessionToken<T>(other as T, timer);
  res.cookie(cookieName, sessionToken, {
    signed: true,
    httpOnly: true,
    sameSite: 'strict',
    domain: new URL(config.ORIGIN).hostname,
    secure: config.ORIGIN.startsWith('https'),
  });
}

export function refreshSessionCookie<T extends object>(values: T & { cookieName: string }, timer: string = '15m'): string {
  const { cookieName, ...other } = values;

  const sessionToken = createSessionToken<T>(other as T, timer);
  const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
  return cookie.serialize(cookieName, `s:${signedCookieValue}`, {
    httpOnly: true,
    sameSite: 'strict',
    domain: new URL(config.ORIGIN).hostname,
    secure: config.ORIGIN.startsWith('https'),
  });
}
