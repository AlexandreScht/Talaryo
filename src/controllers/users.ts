import { InvalidArgumentError, InvalidSessionError } from '@/exceptions';
import { createToken, refreshCookie } from '@/libs/token';
import auth from '@/middlewares/auth';
import { getKeyToken } from '@/utils/keyToken';
import {
  confirmPasswordValidator,
  keyValidator,
  limitValidator,
  pageValidator,
  passwordValidator,
  roleValidator,
  stringValidator,
  usersValidator,
} from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import MailerServiceFile from '@services/mailer';
import UsersServiceFile from '@services/users';
import { transaction } from 'objection';
import { Container } from 'typedi';

const UsersController = ({ app }) => {
  const UserServices = Container.get(UsersServiceFile);
  const MailerService = Container.get(MailerServiceFile);
  app.put(
    '/update-current-user',
    mw([
      validator({
        body: {
          firstName: stringValidator,
          lastName: stringValidator,
          role: roleValidator,
          society: stringValidator,
        },
      }),
      auth(),
      async ({ locals: { body }, session: { sessionId }, res, next }) => {
        try {
          const userUpdate = await UserServices.updateCurrentUser(body, sessionId);
          if (!userUpdate) {
            throw new InvalidSessionError();
          }
          if (body.role) {
            const cookie = refreshCookie(userUpdate);
            res.setHeader('set-cookie', cookie);
          }
          const { jwt } = await createToken(userUpdate);
          res.status(201).send({ payload: jwt });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.patch(
    '/validate-account',
    mw([
      validator({
        body: {
          accessToken: keyValidator.required(),
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

          res.status(201).send({ message: 'Votre compte a été validé avec succès' });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/asking-reset-password/:email',
    mw([
      validator({
        params: {
          email: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          params: { email },
        },
        res,
        next,
      }) => {
        try {
          const [found, user] = await UserServices.findUserByEmail(email, true);

          if (!found) {
            res.status(201).send({ message: "Un lien de réinitialisation vous sera envoyé si l'adresse mail est reconnue" });
            return;
          }

          await transaction(UserServices.getModel, async trx => {
            const Token = await UserServices.askingReset(user.id, trx);
            await MailerService.ResetPassword(email, Token);
            await trx.commit();
          });

          res.status(201).send({ message: "Un lien de réinitialisation sera envoyé si l'adresse mail est reconnue" });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/checking-reset-password/:token',
    mw([
      validator({
        params: {
          token: keyValidator.required(),
        },
      }),
      async ({
        locals: {
          params: { token },
        },
        res,
        next,
      }) => {
        try {
          const [accessToken, id] = getKeyToken(token);

          const [found, user] = await UserServices.findUserById(Number.parseInt(id));

          const timer = new Date(new Date().getTime() - 15 * 60 * 1000);

          if (!found || new Date(user.updatedAt) < timer) {
            throw new InvalidArgumentError('Ce lien de réinitialisation est invalide ou a expiré.');
          }

          const success = accessToken === user.accessToken;

          if (!success) {
            throw new InvalidArgumentError('Ce lien de réinitialisation est invalide ou a expiré.');
          }

          res.status(201).send({ res: true });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );

  app.patch(
    '/confirm-reset-password',
    mw([
      validator({
        body: {
          password: passwordValidator.required(),
          confirm: confirmPasswordValidator.required(),
          token: keyValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { password, token },
        },
        res,
        next,
      }) => {
        try {
          const [accessToken, id] = getKeyToken(token);

          const rowEdited = await UserServices.resetPassword(password, accessToken, id);
          res.status(201).send({ res: !!rowEdited });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.get(
    '/get-all-users',
    mw([
      auth('admin'),
      validator({
        query: {
          limit: limitValidator.default(10),
          page: pageValidator.default(1),
          firstName: stringValidator,
          lastName: stringValidator,
          email: stringValidator,
          role: roleValidator,
        },
      }),
      async ({
        locals: {
          query: { limit, page, firstName, lastName, email, role },
        },
        res,
        next,
      }) => {
        try {
          const meta = await UserServices.getAll({ firstName, lastName, email, role, limit, page });
          res.status(201).send({ res: meta });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.put(
    '/update-users',
    mw([
      auth('admin'),
      validator({
        body: {
          users: usersValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { users },
        },
        res,
        next,
      }) => {
        try {
          const update = await UserServices.updateUsers(users);
          res.status(201).send({ res: !!update });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default UsersController;
