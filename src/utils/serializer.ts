import { regionCode, regionLoc } from '@/config/regionLoc';
import { deburr } from 'lodash';
import type Stripe from 'stripe';

export function serialize_recurring(recurring: Stripe.Price.Recurring, name: boolean) {
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
}

export function serializeLoc(locs: string[], zone: boolean): string {
  return locs.reduce((acc, loc) => {
    const codeLoc = Number.parseInt(loc.substring(1, 3), 10);
    const region = !zone ? regionCode[codeLoc].toLowerCase() : regionLoc[codeLoc].toLowerCase();
    return `${acc} | "${!zone ? '*' : loc.split(':')[1].toLowerCase()},${region}"`;
  }, '');
}

export function normalizeString(str: string) {
  return deburr(str).toLowerCase();
}
