import { userPayload } from '@/interfaces/users';
import type NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User extends userPayload {}
  interface Session {
    user: userPayload;
  }
  interface Jwt {
    token: string;
  }
  interface Profile {
    email_verified: boolean;
    email: string;
    at_hash: string;
    jwt: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: string;
    role: role;
  }
}

export default NextAuth;
