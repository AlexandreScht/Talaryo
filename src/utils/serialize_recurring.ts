import type Stripe from 'stripe';

const serialize_recurring = (
  recurring: Stripe.Price.Recurring,
  name: boolean,
) => {
  if (!name) {
    if (recurring.interval === 'month') {
      return `${recurring.interval_count > 1 ? recurring.interval_count + ' mois' : 'mois'}`;
    }
    if (recurring.interval === 'year') {
      return 'ans';
    }
  }
  if (recurring.interval === 'month') {
    if (recurring.interval_count === 3) {
      return 'Trimestriel';
    }
    return 'Mensuel';
  }
  return 'Annuel';
};

export default serialize_recurring;
