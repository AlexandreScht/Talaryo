import { InvalidArgumentError } from '@/exceptions';
import { getKeyToken } from '@/utils/keyToken';
import { confirmPasswordValidator, passwordValidator, stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import MailerServiceFile from '@services/mailer';
import UsersServiceFile from '@services/users';
import { transaction } from 'objection';
import { Container } from 'typedi';

const UsersController = ({ app }) => {
  const UserServices = Container.get(UsersServiceFile);
  const MailerService = Container.get(MailerServiceFile);
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
          token: stringValidator.required(),
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
          token: stringValidator.required(),
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
};
export default UsersController;
