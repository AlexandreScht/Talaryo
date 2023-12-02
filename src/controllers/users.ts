import { stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import UsersServiceFile from '@services/users';
import { Container } from 'typedi';

const UsersController = ({ app }) => {
  const UserServices = Container.get(UsersServiceFile);
  app.patch(
    '/validate-account',
    mw([
      validator({
        body: {
          accessToken: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { accessToken },
        },
        res,
        next,
      }) => {
        try {
          await UserServices.ValidateUserAccount(accessToken);

          res.status(201).send({ message: 'Your account has been successfully validated' });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default UsersController;
