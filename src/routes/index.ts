import type { ParamsType, QueryType, RouteObject, RoutesPropsType } from '@/interfaces/routes';

export const createRouteWithProps = (route: string, params?: ParamsType<unknown>, query?: QueryType<Record<string, unknown>>): string => {
  let fullRoute = route;

  if (params) {
    const customParams = Array.isArray(params) ? params : [params];
    const ps = customParams
      .filter(v => v)
      .map(v => (v ? encodeURIComponent(v.toString()) : ''))
      .join('/');

    if (ps) {
      fullRoute += `/${ps}`;
    }
  }

  if (query) {
    const searchParams = new URLSearchParams();

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key) && query[key] !== undefined) {
        searchParams.append(key, query[key]?.toString());
      }
    }

    const qs = searchParams.toString();
    if (qs) {
      fullRoute += `?${qs}`;
    }
  }

  return fullRoute;
};

//* exemple: { key1: "value1", key2: 15 }
export const createRouteWithQueries = (route: string, queries?: QueryType<unknown>): string => {
  if (queries === undefined || queries === null) {
    return route;
  }

  const searchParams = new URLSearchParams();

  for (const key in queries) {
    if (Object.prototype.hasOwnProperty.call(queries, key) && queries[key] !== undefined) {
      searchParams.append(key, queries[key]?.toString());
    }
  }

  const qs = searchParams.toString();

  return qs ? `${route}?${qs}` : route;
};

//* exemple: ["value1", 15]
export const createRouteWithParams = (route: string, params?: ParamsType<unknown>): string => {
  if (!params) {
    return route;
  }

  const customParams = Array.isArray(params) ? params : [params];

  const ps = customParams
    .filter(v => v)
    .map(v => (v ? encodeURIComponent(v.toString()) : ''))
    .join('/');

  return ps ? `${route}/${ps}` : route;
};

function createRoutes<T extends RouteObject>(obj: T, basePath: string = ''): T {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];

    if (typeof value === 'function') {
      return {
        ...acc,
        [key]: (args: RoutesPropsType) => `${basePath}${value(args)}`,
      };
    }
    if (typeof value === 'object' && value !== null) {
      return {
        ...acc,
        [key]: createRoutes(value, `${basePath}/${key}`),
      };
    }

    return acc;
  }, {} as T);
}

const routesDir = {
  pages: {
    home: () => '/dashboard',
    register: () => '/signup',
    login: () => '/',
    password: () => '/reset-password',
    candidats: {
      reseauxResult: (params?: ParamsType<number>) => createRouteWithParams('/pro', params),
      cvResult: (params?: ParamsType<number>) => createRouteWithParams('/cv', params),
    },
    cv: (query?: QueryType<Record<string, string | number>>) => createRouteWithQueries('/cv', query),
    pro: (query?: QueryType<Record<string, string | number>>) => createRouteWithQueries('/reseaux-pro', query),
    'reset-password': {
      reset: (query?: QueryType<string>) => createRouteWithQueries('/new', query),
    },
    favoris: (params?: ParamsType<string>) => createRouteWithParams('/favoris', params),
    searches: (params?: ParamsType<string>) => createRouteWithParams('/searches', params),
    signup: {
      confirmEmail: () => '/confirm-email',
    },
    twoFactorType: () => '/twoFactorType',
    profil: () => '/profile',
    news: () => 'https://talaryo.com',
    blog: () => 'https://talaryo.com',
    unauthorized: () => '/unauthorized',
    notFund: () => '/not-found',
    billing: (params?: ParamsType<'pro' | 'business'>) => createRouteWithParams('/billing', params),
    payment: {
      paidSuccess: () => '/successful',
    },
    //> admin
    userOffice: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/backoffice-users', query),
    trainIa: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/trainingIA', query),
  },
  api: {
    auth: {
      register: () => '/register',
      login: () => '/login',
      oAuth: () => '/OAuth',
      askCode: () => '/askCode',
      active2FA: () => '/active2FA',
      verify2FA: (params: ParamsType<unknown>) => createRouteWithParams('/verify2FA', params),
      validateAccount: (params: ParamsType<unknown>) => createRouteWithParams('/validate-account', params),
      askResetPassword: (params: ParamsType<string>) => createRouteWithParams('/reset-password', params),
      newResetPassword: () => '/reset-password',
    },
    users: {
      // updateCurrentUser: () => '/update',
      allUsers: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/getAll', query),
      updateUser: (params?: ParamsType<number>) => createRouteWithParams('/update', params),
    },
    subscribe: {
      getCurrentSub: () => '/get',
      updateSub: () => '/update',
      cancelSub: () => '/cancel',
      createSub: () => '/new',
      getInvoices: () => '/invoices',
    },
    scores: {
      addingScore: () => '/improve',
      getScores: (query: QueryType<Record<string, unknown>>) => createRouteWithQueries('/get', query),
      getTotalScores: (params: ParamsType<string>) => createRouteWithParams('/get', params),
    },
    scrapping: {
      scrapCV: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/cv', query),
      cvContent: (params?: ParamsType<string>) => createRouteWithParams('/cv', params),
      scrapSearch: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/candidate', query),
      scrapMail: (query?: QueryType<Record<string, unknown>>) => createRouteWithQueries('/personal-data', query),
    },
    favoris: {
      addFavori: () => '/new',
      updateFavori: (params: ParamsType<string>) => createRouteWithParams('/update', params),
      getFavoris: (params?: ParamsType<string>, query?: QueryType<Record<string, unknown>>) => createRouteWithProps('/get', params, query),
      removeFavoris: (params: ParamsType<string>) => createRouteWithParams('/remove', params),
      // getLastFavoris: (query?: QueryType) =>
      //   createRouteWithQueries('/get-lastFavoris', query),
    },
    favFolders: {
      addFavFolder: () => '/new',
      removeFavFolder: (params?: ParamsType<string>) => createRouteWithParams('/remove', params),
      getFavFolders: (query: QueryType<Record<string, unknown>>) => createRouteWithQueries('/get', query),
    },
    searchFolder: {
      addSearchFolder: () => '/new',
      removeSearchFolder: (params?: ParamsType<string>) => createRouteWithParams('/remove', params),
      getSearchFolders: (query: QueryType<Record<string, unknown>>) => createRouteWithQueries('/get', query),
    },
    searches: {
      addSearch: () => '/new',
      getSearches: (params?: ParamsType<string>, query?: QueryType<Record<string, unknown>>) => createRouteWithProps('/get', params, query),

      // getLastSearches: (query?: QueryType) =>
      //   createRouteWithQueries('/get-lastSearches', query),
      // getTotalSearches: (params?: ParamsType) =>
      //   createRouteWithParams('/get-totalSearches', params),
      removeSearch: (params?: ParamsType<string>) => createRouteWithParams('/remove', params),
    },
  },
};

// trainingIA: (query?: QueryType) =>
//   createRouteWithQueries('/trainingIA', query),

// communeCodeLoc: (z: Zone) =>
//   `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(z.search)}&fields=nom,codesPostaux,departement,region`,
// communeNameLoc: (z: Zone) =>
//   `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(z.search)}&fields=nom,codesPostaux,departement,region`,
// regionCodeLoc: (z: Zone) =>
//   `https://geo.api.gouv.fr/regions?code=${encodeURIComponent(z.search)}&fields=nom`,
// regionNameLoc: (z: Zone) =>
//   `https://geo.api.gouv.fr/regions?nom=${encodeURIComponent(z.search)}&fields=nom`,

const routes: {
  api: typeof routesDir.api;
  pages: typeof routesDir.pages;
} = {
  api: createRoutes(routesDir.api),
  pages: createRoutes(routesDir.pages),
};

export default routes;
