import { InvalidCredentialsError, ServicesError } from '@/exceptions';
import type {
  loginService,
  registerService,
  registerServiceCredentials,
  registerServiceOAuth,
  RegisterServiceReturnType,
} from '@/interfaces/service';
import { UserDocument } from '@/interfaces/users';
import { UserModel } from '@/models/users';
import { genSalt, hash } from 'bcrypt';
import randomatic from 'randomatic';
import { Service } from 'typedi';
import { v7 as uuid } from 'uuid';

@Service()
class AuthServiceFile {
  public async register<T extends registerService>(userData: T): Promise<RegisterServiceReturnType<T>> {
    try {
      if ('password' in userData && userData.password) {
        // Si password est présent, retournez registerServiceCredentials
        const salt = await genSalt(10);
        const hashedPassword = await hash(userData.password, salt);
        const user = new UserModel({
          ...userData,
          password: hashedPassword,
          accessToken: uuid(),
          accessCode: Number.parseInt(randomatic('0', 6), 10),
        });

        const credentials: registerServiceCredentials = {
          _id: user._id,
          accessToken: user.accessToken,
          accessCode: user.accessCode as number,
          save: () => user.save(),
        };

        return credentials as RegisterServiceReturnType<T>;
      } else {
        // Sinon, retournez registerServiceOAuth
        const user = new UserModel({
          ...userData,
          validate: true,
        });

        await user.save();

        const oauth: registerServiceOAuth = {
          _id: user._id,
          role: user.role,
        };

        return oauth as RegisterServiceReturnType<T>;
      }
    } catch (error) {
      console.log(error);
      throw new ServicesError('Une erreur est survenue lors de votre enregistrement');
    }
  }

  public async login({ password, id }: loginService): Promise<UserDocument | undefined> {
    const userData = await UserModel.findById(id).select('firstName lastName role passwordReset _id password');

    if (!userData) throw new InvalidCredentialsError(`Email ou Mot de passe incorrect`);

    if (await userData.checkPassword(password)) {
      return userData;
    }
    throw new InvalidCredentialsError('Email ou Mot de passe incorrect');
  }
}

export default AuthServiceFile;
