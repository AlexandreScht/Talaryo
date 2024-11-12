import { getErrorMessage } from '@/exceptions/errorMessage';
import { loc } from '@/interfaces/components';
import type { ResponseType, Zone } from '@/interfaces/services';
import { localisationValidator } from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import axios from 'axios';

const routeDir: Record<string, string> = {
  Nc: 'communeCodeLoc',
  c: 'communeNameLoc',
  Nr: 'regionCodeLoc',
  r: 'regionNameLoc',
};

const routes = {
  communeCodeLoc: (z: Zone) =>
    `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(z.search)}&fields=nom,codesPostaux,departement,region`,
  communeNameLoc: (z: Zone) =>
    `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(z.search)}&fields=nom,codesPostaux,departement,region`,
  regionCodeLoc: (z: Zone) =>
    `https://geo.api.gouv.fr/regions?code=${encodeURIComponent(z.search)}&fields=nom`,
  regionNameLoc: (z: Zone) =>
    `https://geo.api.gouv.fr/regions?nom=${encodeURIComponent(z.search)}&fields=nom`,
};

export const localizationService =
  () =>
  async (values: unknown): Promise<ResponseType<loc>> => {
    try {
      validator(localisationValidator, values as Zone);
      const routeName = routeDir[
        `${typeof (values as Zone).search === 'number' ? 'N' : ''}${(values as Zone).zone.charAt(0).toLowerCase()}`
      ] as keyof typeof routes;

      const { data } = await axios.get(routes[routeName](values as Zone));

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
