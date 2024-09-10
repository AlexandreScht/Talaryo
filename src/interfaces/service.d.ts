import { role, UserDocument } from './users';

interface returnUpdateCode {
  accessCode: number;
  accessToken?: string;
  email: string;
  firstName: string;
}

//* auth
interface loginService {
  id: string;
  password: string;
}
interface registerOauth {
  email: string;
  firstName: string;
  lastName: string;
}
interface registerCredentials extends registerOauth {
  password: string;
}
type registerService = registerOauth | registerCredentials;

interface registerServiceCredentials {
  _id: string;
  accessCode: number;
  accessToken: string;
  save: () => Promise<UserDocument>;
}
interface registerServiceOAuth {
  _id: string;
  role: role;
}

type RegisterServiceReturnType<T> = T extends { password?: string }
  ? T extends { password: string }
    ? registerServiceCredentials
    : object
  : registerServiceOAuth;
