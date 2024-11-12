'use client';

import { externeItems, mainProps, menuItems } from '@/interfaces/layout';
import { role } from '@/interfaces/users';
import { haveAccess } from '@/middlewares/autorisation';
import routes from '@/routes';
import cn from '@/utils/cn';
import { InfoToast } from '@/utils/toaster';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

export const LayoutLink = ({ User, menuItems, externeItems, children, className }: mainProps) => {
  const pathName = usePathname();
  const { theme } = useTheme();

  const isCurrentPage = useCallback(
    (route: string | string[]) => {
      const currentPath = `/${pathName.split('/').slice(1, 3).join('/')}`;
      if (route === routes.pages.favoris()) {
        return `/${currentPath.split('/')[1]}` === route;
      }

      if (Array.isArray(route)) {
        return route.includes(currentPath);
      }
      return currentPath === route;
    },
    [pathName],
  );

  const handleClickNotYet = useCallback(() => InfoToast({ text: "Cette page n'est pas encore disponible." }), []);

  const handleClickPermission = useCallback((role: role) => {
    if (!role) {
      InfoToast({
        text: `Cette fonctionnalité est disponible uniquement avec un abonnement`,
      });
      return;
    }
    InfoToast({
      text: `Cette fonctionnalité est disponible à partir de l'abonnement ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    });
  }, []);

  const MenuItem = ({ icon, label, route, plan }: menuItems) =>
    route ? (
      haveAccess({
        route: Array.isArray(route) ? route[0] : route,
        user: User,
      }) ? (
        <li
          className={cn('py-1 pl-0 xl:pl-2 rounded-r-md', {
            'hover:bg-successBg': !isCurrentPage(route),
          })}
        >
          <Link className="flex flex-row items-center" href={Array.isArray(route) ? route[0] : route}>
            <div
              className={cn('!text-h1 mr-2 xl:mr-4 transition-all', {
                'text-secondary scale-110': isCurrentPage(route),
              })}
            >
              {icon}
            </div>
            <span
              className={cn('text-h2 mt-1 lg:mt-0.5 transition-all', {
                '!text-gradient font-bold text-h2': isCurrentPage(route),
              })}
            >
              {label}
            </span>
          </Link>
        </li>
      ) : (
        <li
          className="py-1 pl-0 xl:pl-2 rounded-r-md hover:cursor-not-allowed hover:bg-successBg opacity-60"
          onClick={() => handleClickPermission(plan)}
        >
          <div className="flex flex-row items-center">
            <div className="text-h1 mr-2 xl:mr-4">{icon}</div>
            <span className="text-h2 lg:mt-0.5">{label}</span>
          </div>
        </li>
      )
    ) : (
      <li className="py-1 pl-0 xl:pl-2 rounded-r-md hover:cursor-not-allowed hover:bg-successBg opacity-60" onClick={handleClickNotYet}>
        <div className="flex flex-row items-center">
          <div className="text-h1 mr-2 xl:mr-4">{icon}</div>
          <span className="text-h2 lg:mt-0.5 line-through">{label}</span>
        </div>
      </li>
    );

  const ExterneItem = ({ icon, label, route }: externeItems) =>
    label === 'Souscrire à un Plan' || label === 'Changer de Plan' ? (
      <li className="rounded-r-md w-full md:px-4 lg:px-6">
        <Link
          className={cn(
            'flex flex-row text-center items-center md:py-2.5 md:px-3 lg:py-3 xl:px-6 rounded-md lg:rounded-lg text-white/90 font-semibold bg-gradient-to-tr transition-transform hover:scale-105 from-secondary/90 to-primary/80',
            {
              'bg-gradient-to-tr from-primary to-secondary/80': theme === 'light',
            },
          )}
          href={route}
        >
          <span className="w-full text-center text-p1">{label}</span>
        </Link>
      </li>
    ) : (
      <li
        className={cn('py-1 pl-8 rounded-r-md', {
          'hover:bg-successBg': !isCurrentPage(route),
        })}
      >
        <Link className="flex flex-row items-center" href={route}>
          <div className="text-h1 mr-2 xl:mr-4">{icon}</div>
          <span className="text-h2 lg:mt-0.5">{label}</span>
        </Link>
      </li>
    );

  if (menuItems) {
    return (
      <ul className={cn('mt-6 xl:mt-10 pl-7 lg:pl-8 space-y-4 lg:space-y-5 xl:space-y-7 text-3xl text-asset relative', { className })}>
        {menuItems.map(item => (
          <MenuItem key={item.label} {...item} />
        ))}
        {children}
      </ul>
    );
  }

  return (
    <ul className={cn('mt-10 space-y-5 xl:space-y-7 text-3xl text-asset relative', { className })}>
      {externeItems.map(item => (
        <ExterneItem key={item.label} {...item} />
      ))}
    </ul>
  );
};
