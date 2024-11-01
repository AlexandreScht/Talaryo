import type { Request } from 'express';
import type Stripe from 'stripe';

interface StripeRequest extends Request {
  event?: Stripe.Event;
}
