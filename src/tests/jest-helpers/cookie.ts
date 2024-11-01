import config from '@/config';
import { TokenUser } from '@/interfaces/token';
import { createSessionToken } from '@/utils/token';
import { signedCookie } from 'cookie-parser';
import signCookie from 'cookie-signature';
import { jwtDecode } from 'jwt-decode';
import type { Response } from 'supertest';

export function getSignedCookieValue<T>(res: Response, name: string | string[]) {
  const names = Array.isArray(name) ? name : [name];
  const rawCookie = res.headers['set-cookie'];
  const cookies: string[] = Array.isArray(rawCookie) ? rawCookie : [rawCookie];

  return names.reduce((acc, cookieName) => {
    const getCookie = cookies.find((cookie: string) => cookie?.startsWith(`${cookieName}=`));
    if (getCookie) {
      const [token, ...attributes] = getCookie.split(';');
      const tokenValue = token.split('=')[1];

      const isExpired = attributes.some(attr => attr.trim().startsWith('Expires=Thu, 01 Jan 1970'));

      if (isExpired || !tokenValue) {
        return acc;
      }

      const parsedToken = tokenValue.startsWith('s%3A')
        ? (signedCookie(tokenValue.substring(4), config.security.cookie.COOKIE_TOKEN) as string)
        : tokenValue;

      const decoded = jwtDecode(parsedToken);
      return { ...acc, [cookieName]: decoded };
    }
    return acc;
  }, {} as Partial<T>);
}

export function authCookie(user: TokenUser) {
  const sessionToken = createSessionToken<object>(user, '1m');
  const signedCookieValue = signCookie.sign(sessionToken, config.security.cookie.COOKIE_TOKEN);
  return `${config.COOKIE_NAME}=s:${signedCookieValue}`;
}
