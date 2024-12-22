import type { UserModel, UserShape } from '@/models/pg/users';

interface returnUpdateCode {
  accessCode: number | string;
  accessToken?: string;
  email: string;
  firstName: string;
}

//* auth
interface registerOauth {
  email: string;
  firstName?: string;
  lastName?: string;
}
interface registerCredentials extends registerOauth {
  password: string;
}
export type registerService = registerOauth | registerCredentials;

interface registerServiceCredentials {
  id: number;
  accessCode: number;
  accessToken: string;
}
interface registerServiceOAuth {
  id: number;
  role: role;
  email: string;
  createdAt: Date;
}

export type RegisterServiceReturnType<T> = T extends { password?: string }
  ? T extends { password: string }
    ? registerServiceCredentials
    : object
  : registerServiceOAuth;

interface QueryOperator<T> {
  are?: T | T[];
  not?: T | T[];
}

type QueryCriteria<T> = {
  [K in keyof T]?: T[K] | QueryOperator<T[K]>; // Allows values or operators for each field
};

//* User
interface UserServiceFileType {
  getUser(userData: FindUserProps, fields?: (keyof Partial<UserShape>)[]): Promise<UserShape | null>;

  updateUsers(
    criteria: QueryCriteria<Omit<UserShape, 'password'>>,
    values: Partial<Omit<UserShape, '_id' | 'email'>>,
    returnValues?: (keyof UserModel)[],
  ): Promise<UserModel | boolean>;
}
