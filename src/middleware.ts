import { getToken } from 'next-auth/jwt';
import { type NextMiddlewareWithAuth, type NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextResponse } from 'next/server';
import { userPayload } from './interfaces/users';
import { adminPaths, haveAccess, publicPaths, roleAccess } from './middlewares/autorisation';

export default withAuth(
  async function middleware(req: NextRequestWithAuth): Promise<NextMiddlewareResult> {
    const user = (await getToken({ req })) as userPayload;

    if (!!user && adminPaths.includes(req.nextUrl.pathname) && !roleAccess('admin', user)) {
      return NextResponse.redirect(new URL('not-found', req.nextUrl.origin).toString());
    }

    if (!!user && !haveAccess({ route: req.nextUrl.pathname, user })) {
      return NextResponse.redirect(new URL('unauthorized', req.nextUrl.origin).toString());
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => !!token || publicPaths.includes(req.nextUrl.pathname),
    },
    pages: {
      signIn: '/',
      error: '/',
    },
  },
) as NextMiddlewareWithAuth;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
