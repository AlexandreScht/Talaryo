import { ClientException, InvalidCredentialsError, TwoFactoryAuthError } from '@/exceptions';

import { getErrorMessage } from '@/exceptions/errorMessage';
import { fullLoginForm } from '@/interfaces/services';
import routes from '@/routes';
import PrepareServices from '@/services';
import { NextAuthOptions, User } from 'next-auth';
// import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';

const deleteCookie = () => {
  if (!process.env.COOKIE_NAME) {
    return;
  }
  cookies().set({
    name: process.env.COOKIE_NAME,
    value: '',
    expires: new Date(0),
  });
};

const nextAuthOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET,
    // }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {},
      async authorize(credentials) {
        const credentialsProps = (credentials || {}) as fullLoginForm | { otp: string };

        if ('otp' in credentialsProps) {
          //; 2FA methode
          const { otp } = credentialsProps;

          if (!otp) {
            throw new ClientException(400, 'Veuillez entrer toutes les bonnes informations');
          }
          const { verify2FA } = PrepareServices();

          const { err, res: user } = await verify2FA(Number.parseInt(otp, 10));

          if (err || !user) {
            const { err: msgError, code } = getErrorMessage(err);

            throw new ClientException(typeof code === 'number' ? code : 500, msgError);
          }
          return user as User;
        }

        //; credentials
        const { email, password, token } = credentialsProps;

        if (!email || !password || !token) {
          throw new ClientException(400, 'Veuillez entrer toutes les bonnes informations');
        }

        const { login } = PrepareServices();

        const { err, res } = await login<fullLoginForm>({
          email,
          password,
          token,
        });

        if (err || !res) {
          const { err: msgError, code } = getErrorMessage(err);

          throw new ClientException(typeof code === 'number' ? code : 500, msgError);
        }

        const { TwoFA, ...user } = res;

        if (TwoFA) throw new TwoFactoryAuthError(TwoFA);

        return user as User;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'credentials') {
        return true;
      }

      if (account?.provider === 'google') {
        try {
          if (!profile?.email_verified) {
            throw new InvalidCredentialsError(encodeURIComponent("L'adresse e-mail Google est invalide ou non vérifiée"));
          }
          const { id_token } = account;

          const { oAuth } = PrepareServices({ token: id_token });

          const { err, res: userOauth } = await oAuth();

          if (err || !userOauth) {
            const { err: msgError, code } = getErrorMessage(err);

            throw new ClientException(typeof code === 'number' ? code : 500, msgError);
          }

          Object.assign(user, userOauth);
          return true;
        } catch (error) {
          console.log(error);
          throw new ClientException();
        }
      }
      return false;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }

      return { ...token, ...user };
    },
    async session({ session, token }) {
      session.user = { ...session.user, ...token };
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 31 * 24 * 60 * 60, // 30 jours
  },
  jwt: {
    maxAge: 31 * 24 * 60 * 60,
  },
  pages: {
    signIn: routes.pages.login(),
    signOut: routes.pages.login(),
    error: routes.pages.login(),
  },
  events: {
    async signOut() {
      console.log('here !!!!!§§§§§§!!!!!!');

      deleteCookie();
    },
  },
};

export default nextAuthOptions;
