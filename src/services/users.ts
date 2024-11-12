import { getErrorMessage } from '@/exceptions/errorMessage';
import type { ResponseType } from '@/interfaces/services';
import { UserSchema, role } from '@/interfaces/users';
import { DistantUserUpdateSchemaValidator, UserUpdateSchemaValidator, getAllUsersSchemaValidator } from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import type { AxiosInstance } from 'axios';
const {
  api: { users: router },
} = routes;
export const UpdateUserService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: {
    user: Omit<
      UserSchema,
      'password' | 'accessToken' | 'accessCode' | 'passwordReset' | 'stripeCustomer' | 'subscribe_start' | 'subscribe_end' | 'email'
    >;
    selector?: { id: number } | { email: string };
  }): Promise<ResponseType<{ role: role; firstName: string; lastName: string; society?: string }>> => {
    try {
      const distantUpdate = 'selector' in props;
      distantUpdate ? validator(DistantUserUpdateSchemaValidator, props) : validator(UserUpdateSchemaValidator, props);

      const { selector, user } = props as unknown as any;

      const { data } = await axios.patch(router.updateUser([selector?.id ?? selector?.email]), user);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

// export const UpdateCurrentUsersService =
//   ({ axios }: { axios: AxiosInstance }) =>
//   async (values: unknown): Promise<ResponseType> => {
//     try {
//       validator(UserUpdateSchemaValidator, values as UsersType);
//       const {
//         data: { res },
//       } = await axios.put(routes.api.updateUsers(), values);

//       return { res: data };
//     } catch (err: unknown) {
//       return getErrorMessage(err);
//     }
//   };

export const getAllUsersService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    props?: Partial<{
      limit: number;
      page: number;
      firstName: string;
      email: string;
      lastName: string;
      role: role;
    }>,
  ): Promise<ResponseType<Partial<UserSchema>[]>> => {
    try {
      validator(getAllUsersSchemaValidator, props || {});
      const {
        data: {
          meta: { results },
        },
      } = await axios.get(router.allUsers(props));

      return { res: results };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
