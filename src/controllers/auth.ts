import config from '@/config';
import { authorizeUser } from '@/config/devList';
import { createCookie, createToken } from '@/libs/token';
import { InvalidSessionError, NotFoundError, ServerException } from '@exceptions';
import OAuthTokenCheck from '@libs/OAuthToken';
import { confirmPasswordValidator, emailValidator, keyValidator, passwordValidator, stringValidator } from '@libs/validate';
import isHuman from '@middlewares/isHuman';
import mw from '@middlewares/mw';
import slowDown from '@middlewares/slowDown';
import validator from '@middlewares/validator';
import MailerServiceFile from '@services/mailer';
import UsersServiceFile from '@services/users';
import { transaction } from 'objection';
import { Container } from 'typedi';
import { v4 as uuidv4 } from 'uuid';

const AuthController = ({ app }) => {
  const UserServices = Container.get(UsersServiceFile);
  const MailerService = Container.get(MailerServiceFile);
  app.post(
    '/register',
    mw([
      validator({
        body: {
          email: emailValidator.required(),
          password: passwordValidator.required(),
          firstName: stringValidator.required(),
          lastName: stringValidator.required(),
          confirm: confirmPasswordValidator.required(),
          token: keyValidator.required(),
        },
      }),
      isHuman(),
      async ({
        locals: {
          body: { email, password, firstName, lastName },
        },
        res,
        next,
      }) => {
        try {
          const { ORIGIN, NODE_ENV } = config;

          if (NODE_ENV === 'production' && new URL(ORIGIN).hostname === 'test.talaryo.com' && !authorizeUser.includes(email)) {
            throw new ServerException(404, 'Seul les comptes développeur peuvent ce connecter sur ce site');
          }

          const [found] = await UserServices.findUserByEmail(email, true);

          if (found) {
            res.status(201).send({ result: 'Un email de confirmation sera envoyé si vos données sont valides' });
            return;
          }

          await transaction(UserServices.getModel, async trx => {
            const user = await UserServices.register(
              { email, password, firstName, lastName, ...(authorizeUser.includes(email) ? { role: 'admin' } : {}) },
              trx,
            );
            await MailerService.Confirmation(user.email, firstName, user.accessToken);
            await trx.commit();
          });

          res.status(201).send({ result: 'Un email de confirmation sera envoyé si vos données sont valides' });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.post(
    '/login',
    mw([
      slowDown(500),
      validator({
        body: {
          email: emailValidator.required(),
          password: stringValidator.required(),
          token: keyValidator.required(),
        },
      }),
      isHuman(),
      async ({
        locals: {
          body: { email, password },
        },
        res,
        next,
      }) => {
        try {
          const [found, user] = await UserServices.findUserByEmail(email, true);

          if (!found) {
            throw new NotFoundError(`Email ou mot de passe invalide`);
          }

          if (!user.validate) {
            throw new InvalidSessionError('Veuillez valider votre compte par e-mail');
          }

          await UserServices.login(user, password);
          const refreshToken = uuidv4();

          const tokenData = await createToken(user);
          const cookie = createCookie(user, refreshToken);

          await UserServices.setRefreshToken(user, refreshToken);

          res.setHeader('Set-Cookie', cookie);

          res.status(201).send({ payload: tokenData });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
  app.post(
    '/OAuth',
    mw([
      validator({
        body: {
          id_token: keyValidator.required(),
          at_hash: keyValidator.required(),
        },
      }),
      async ({
        locals: {
          body: { at_hash, id_token },
        },
        res,
        next,
      }) => {
        try {
          const { ORIGIN, NODE_ENV } = config;
          const [error, OAuthUser] = await OAuthTokenCheck(id_token, at_hash);

          if (NODE_ENV === 'production' && new URL(ORIGIN).hostname === 'test.talaryo.com' && !authorizeUser.includes(OAuthUser.email)) {
            res.status(404).send({ result: 'Seule les comptes développeur peuvent ce connecter sur ce site' });
            return;
          }

          if (error) {
            throw new InvalidSessionError();
          }

          const [userNotFound, user] = await UserServices.findUserOAuth(OAuthUser.email);

          const currentUser = userNotFound
            ? await UserServices.register({
                email: OAuthUser.email,
              })
            : user;

          const refreshToken = uuidv4();

          const tokenData = await createToken(currentUser);
          const cookie = createCookie(currentUser, refreshToken);

          await UserServices.setRefreshToken(currentUser, refreshToken);

          res.setHeader('Set-Cookie', cookie);

          res.status(201).send({ payload: tokenData });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};

export default AuthController;
