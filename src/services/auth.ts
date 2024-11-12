import { getErrorMessage } from '@/exceptions/errorMessage';
import { activate2FAType, ResponseType, twoFactorType } from '@/interfaces/services';
import { userPayload } from '@/interfaces/users';
import { numberValidator } from '@/libs/validates';
import {
  activate2FASchema,
  AskResetPasswordSchemaValidator,
  createValidator,
  loginSchemaValidator,
  NewPasswordSchemaValidator,
  registerSchemaValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import type { AxiosInstance } from 'axios';
const {
  api: { auth: router },
} = routes;

export const loginService =
  ({ axios }: { axios: AxiosInstance }) =>
  async <V extends object>(values: V): Promise<ResponseType<userPayload & { TwoFA: twoFactorType }>> => {
    try {
      validator(loginSchemaValidator, values);
      const { data } = await axios.post(router.login(), values);
      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const oAuthService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (): Promise<ResponseType<userPayload>> => {
    try {
      const { data } = await axios.get(router.oAuth());
      return { res: data };
    } catch (err: unknown) {
      console.log(err);
      console.log(getErrorMessage(err));

      return getErrorMessage(err);
    }
  };

export const registerService =
  ({ axios }: { axios: AxiosInstance }) =>
  async <V extends object>(values: V): Promise<ResponseType<boolean>> => {
    try {
      validator(registerSchemaValidator, values);
      await axios.post(router.register(), values);

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const askCodeService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (): Promise<ResponseType<string>> => {
    try {
      const { data } = await axios.get(router.askCode());

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const activate2FAService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (values: activate2FAType): Promise<ResponseType<boolean>> => {
    try {
      validator(activate2FASchema, values);
      await axios.patch(router.active2FA(), values);
      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const verify2FAService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (otp: number): Promise<ResponseType<userPayload>> => {
    try {
      validator(createValidator({ otp: numberValidator }), { otp });
      const { data } = await axios.get(router.verify2FA([otp]));

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const validateAccountService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (code: number): Promise<ResponseType<string>> => {
    try {
      validator(createValidator({ code: numberValidator }), { code });
      const { data } = await axios.patch(router.validateAccount([code]));

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const askNewPasswordService =
  ({ axios }: { axios: AxiosInstance }) =>
  async ({ email }: { email: string }): Promise<ResponseType<string>> => {
    try {
      validator(AskResetPasswordSchemaValidator, { email });
      await axios.patch(router.askResetPassword([email]));

      return {
        res: 'Si vos informations sont correctes, un e-mail vous sera envoyé.',
      };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const resetPasswordService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (body: { password: string; confirm: string }): Promise<ResponseType<string>> => {
    try {
      validator(NewPasswordSchemaValidator, body);
      await axios.patch(router.newResetPassword(), body);

      return {
        res: 'Votre mot de passe a été correctement modifié. Vous allez être redirigé vers la page de connexion.',
      };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
