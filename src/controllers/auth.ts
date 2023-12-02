import { InvalidArgumentError, InvalidSessionError, NotFoundError } from '@exceptions';
import OAuthTokenCheck from '@libs/OAuthToken';
import { createCookie, createToken } from '@libs/setToken';
import { emailValidator, passwordValidator, stringValidator } from '@libs/validate';
import isHumain from '@middlewares/isHumain';
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
          token: stringValidator.required(),
        },
      }),
      isHumain(),
      async ({
        locals: {
          body: { email, password, firstName, lastName },
        },
        res,
        next,
      }) => {
        try {
          const [err] = await UserServices.findUserByEmail(email);

          if (!err) {
            throw new InvalidArgumentError(`this email is already used`);
          }

          await transaction(UserServices.getModel, async trx => {
            const user = await UserServices.register({ email, password, firstName, lastName }, trx);
            await MailerService.Confirmation(user.email, firstName, user.accessToken);
            await trx.commit();
          });

          res.status(201).send({ result: 'Confirmation email has been sent' });
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
          token: stringValidator.required(),
        },
      }),
      isHumain(),
      async ({
        locals: {
          body: { email, password },
        },
        res,
        next,
      }) => {
        try {
          const [err, user] = await UserServices.findUserByEmail(email);

          if (err) {
            throw new NotFoundError(`Email or Password is incorrect`);
          }

          if (!user.validate) {
            throw new InvalidSessionError('Please validate your account by mail');
          }

          await UserServices.login(user, password);

          const tokenData = await createToken(user);
          const refreshToken = uuidv4();
          const cookie = createCookie(user, refreshToken);

          await UserServices.setRefreshToken(user, refreshToken);

          res.setHeader('Set-Cookie', cookie);

          res.status(200).send({ payload: tokenData });
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
          id_token: stringValidator.required(),
          at_hash: stringValidator.required(),
          name: stringValidator,
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
          const [error, OAuthUser] = await OAuthTokenCheck(id_token, at_hash);
          console.log(OAuthUser);

          if (error) {
            throw new InvalidSessionError();
          }

          const [userNotFound, user] = await UserServices.findUserOAuth(OAuthUser.email);

          const currentUser = userNotFound
            ? await UserServices.register({ email: OAuthUser.email, firstName: OAuthUser?.given_name, lastName: OAuthUser?.family_name })
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
