import config from '@/config';
import Stripe from 'stripe';

export default function stripeInstance() {
  const { stripeENV } = config;
  return new Stripe(stripeENV.KEY, {
    apiVersion: '2023-08-16',
  });
}
