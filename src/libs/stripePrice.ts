import config from '@/config';
import Stripe from 'stripe';

const {
  security: { stripe_key },
} = config;

const stripeInstance = new Stripe(stripe_key, {
  apiVersion: '2023-10-16',
});

export const getStripePrice = async (v?: string) => {
  if (!v) return { priceId: undefined };

  const prices = await stripeInstance.prices.list({
    lookup_keys: [v],
  });
  if (!prices.data?.length) {
    return undefined;
  }
  const { id, unit_amount, recurring } = prices.data[0];
  const price = (unit_amount || 0) / 100;
  return {
    priceId: id,
    price: Number.isInteger(price)
      ? price
      : Number.parseFloat(price.toFixed(2)),
    recurring: recurring?.interval_count || 0,
  };
};

export const getStripePriceId = async (id?: string) => {
  if (!id) {
    return undefined;
  }
  const {
    unit_amount,
    metadata: { sub_id },
    recurring,
  } = await stripeInstance.prices.retrieve(id);
  if (!unit_amount || !sub_id || !recurring?.interval) {
    return undefined;
  }

  const price = (unit_amount || 0) / 100;
  return {
    price: Number.isInteger(price)
      ? price
      : Number.parseFloat(price.toFixed(2)),
    plan: sub_id,
    recurring,
  };
};

export const getPriceDiscount = async (
  month_key: string,
  currentPrice: number,
) => {
  const {
    data: [{ unit_amount }],
  } = await stripeInstance.prices.list({
    lookup_keys: [month_key],
  });
  if (!unit_amount) {
    return null;
  }
  const monthPrice = unit_amount / 100;
  const discount = ((monthPrice - currentPrice) / monthPrice) * 100;
  return Number.isInteger(discount) ? discount : discount.toFixed(1);
};
