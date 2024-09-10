import type Stripe from 'stripe';

type role = 'free' | 'standard' | 'advanced' | 'premium' | 'admin';
type stripe_status = 'active' | 'pending' | 'disable' | 'waiting';
type twoFactorType = 'authenticator' | 'email';

interface UserDocument extends Document {
  _id: string;
  email: string;
  password: string;
  role: role;
  firstName: string;
  lastName: string;
  validateAccount: boolean;
  accessToken?: string;
  accessCode?: number | string;
  twoFactorType?: twoFactorType;
  stripeCustomer?: string | Stripe.Customer | Stripe.DeletedCustomer;
  subscribeStatus: {
    status: stripe_status;
    start?: Date;
    end?: Date;
  };
  checkPassword(password: string): Promise<boolean>;
}

type FindUserProps = { email: string; oAuthAccount?: boolean } | { id: string };
