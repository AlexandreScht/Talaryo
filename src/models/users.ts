import { InvalidCredentialsError } from '@/exceptions';
import { UserDocument } from '@/interfaces/users';
import { compare } from 'bcrypt';
import { model, Schema } from 'mongoose';

const UserSchema: Schema<UserDocument> = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
    select: false,
  },
  role: {
    type: String,
    enum: ['free', 'standard', 'advanced', 'premium', 'admin'],
    default: 'free',
    required: true,
  },
  twoFactorType: {
    type: String,
    enum: ['authenticator', 'email', null],
    default: null,
    required: false,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  validateAccount: {
    type: Boolean,
    default: false,
  },
  accessCode: {
    type: Schema.Types.Mixed,
    required: false,
    default: null,
    validate: {
      validator: function (value) {
        return typeof value === 'string' || typeof value === 'number' || typeof value === 'undefined';
      },
      message: 'accessCode must be a string or a number',
    },
  },
  accessToken: {
    type: String,
    required: false,
    default: null,
  },
  stripeCustomer: {
    type: String,
    required: false,
  },
  subscribeStatus: {
    status: {
      type: String,
      enum: ['active', 'waiting', 'pending', 'none'],
      default: 'none',
      required: true,
    },
    start: {
      type: Date,
      required: false,
    },
    end: {
      type: Date,
      required: false,
    },
  },
});

UserSchema.pre('save', async function (next) {
  const { password: newUserPassword, email, _id } = this as UserDocument;
  const existingUser = await UserModel.findOne({ email, _id: { $ne: _id } }).select('+password');

  if (existingUser) {
    const { password: sameUserEmailPassword } = existingUser;
    if ((sameUserEmailPassword && newUserPassword) || (!sameUserEmailPassword && !newUserPassword)) {
      throw new InvalidCredentialsError("Un utilisateur avec le même email et la même méthode d'enregistrement existe déjà.");
    }
  }

  next();
});

// Method to compare password securely
UserSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  const user = this as UserDocument;
  if (!user.password) {
    return false;
  }
  return compare(password, user.password);
};

// Export the UserModel
export const UserModel = model<UserDocument>('users', UserSchema);
