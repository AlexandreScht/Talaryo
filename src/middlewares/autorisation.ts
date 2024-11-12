import { role, userPayload } from '@/interfaces/users';
import routes from '@/routes';

const { pages } = routes;

/**
 * An array of routes that are authorized from public access
 * Access to these routes dons't requires authentication
 * @type {string[]}
 */
export const publicPaths: Array<string> = [
  pages.login(),
  pages.password(),
  pages.register(),
  pages.unauthorized(),
  pages.notFund(),
  pages['reset-password'].reset(),
  pages['signup'].confirmEmail(),
];

/**
 * An array of routes that are restricted from general users
 * Access to these routes requires an admin role
 * @type {string[]}
 */
export const freePaths: Array<string> = [
  pages.favoris(),
  pages['payment'].paidSuccess(),
  pages.searches(),
  pages.pro(),
  pages.twoFactorType(),
  pages['candidats'].reseauxResult([1]),
  pages.profil(),
  pages.billing(),
  pages.home(),
];

/**
 * An array of routes that are restricted from general users
 * Access to these routes requires an admin role
 * @type {string[]}
 */
export const proPaths: Array<string> = [pages.cv(), pages['candidats'].cvResult()];

/**
 * An array of routes that are restricted from general users
 * Access to these routes requires an admin role
 * @type {string[]}
 */
export const businessPaths: Array<string> = [];

/**
 * An array of routes that are restricted from general users
 * Access to these routes requires an admin role
 * @type {string[]}
 */
export const adminPaths: Array<string> = [pages.userOffice(), pages.trainIa()];

// ? Hierarchy of Access Levels by Role, from Highest to Lowest
const roleAuthorization: Record<role, { hierarchy: number; pathAccess: string[] }> = {
  admin: {
    hierarchy: 1,
    pathAccess: [...adminPaths, ...businessPaths, ...proPaths, ...freePaths, ...publicPaths],
  },
  business: {
    hierarchy: 2,
    pathAccess: [...businessPaths, ...proPaths, ...freePaths, ...publicPaths],
  },
  pro: {
    hierarchy: 3,
    pathAccess: [...proPaths, ...freePaths, ...publicPaths],
  },
  free: {
    hierarchy: 4,
    pathAccess: [...freePaths, ...publicPaths],
  },
};

export const roleAccess = (role: role, user?: userPayload): boolean => {
  if (!user || !('role' in user)) {
    return false;
  }
  console.log();

  const accessUser = roleAuthorization[user.role]?.hierarchy;
  if (!accessUser) return false;
  return accessUser <= roleAuthorization[role].hierarchy;
};

export const haveAccess = ({ route, user }: { route: string; user?: userPayload }): boolean => {
  if (!user || !('role' in user)) {
    return false;
  }

  const userPathAccess = roleAuthorization[user.role]?.pathAccess;
  if (!userPathAccess) return false;

  return userPathAccess.some(pathPattern => route.startsWith(pathPattern));
};
