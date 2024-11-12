'use server';

import routes from '@/routes';
import { cookies } from 'next/headers';

export default async function logOut() {
  const allCookies = cookies().getAll();
  const nextAuthCookies = allCookies.filter(({ name }) => /^next-auth\./.test(name));
  nextAuthCookies.forEach(({ name }) => {
    cookies().delete(name);
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: routes.pages.login(),
    },
  });
}
