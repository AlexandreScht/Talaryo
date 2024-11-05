import { regionCode, regionLoc } from '@/config/regionLoc';
import type { recurring_period } from '@/interfaces/stripe';
import { deburr } from 'lodash';

export function serialize_recurring(recurring: recurring_period, name: boolean = true) {
  if (!name) {
    if (recurring === 'Mensuel') {
      return 'par Mois';
    }
    if (recurring === 'Annuel') {
      return 'par An';
    }
    return 'par Trimestre';
  }
  if (recurring === 'Mensuel') {
    return 'Mensuel';
  }
  if (recurring === 'Annuel') {
    return 'Annuel';
  }

  return 'Trimestriel';
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
