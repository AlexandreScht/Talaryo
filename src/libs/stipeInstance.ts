import config from '@/config';
import Stripe from 'stripe';

const { stripeENV } = config;

const stripe = new Stripe(stripeENV.KEY, {
  apiVersion: '2023-08-16',
});

export default stripe;
