'use client';

import { menuDownItems } from '@/interfaces/layout';
import { userPayload } from '@/interfaces/users';
import routes from '@/routes';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const NavbarAuth = ({ session }: { session?: userPayload }) => {
  const pathName = usePathname();
  const currentRoutes = routes.pages.userOffice() === pathName;
  const router = useRouter();

  const itemsDown: menuDownItems[] = useMemo(() => {
    if (session) {
      const items = [
        { label: 'Profil', action: routes.pages.profil() },
        { label: 'Déconnexion', action: 'logOut' },
      ];

      if (session?.role === 'admin') {
        items.splice(
          1,
          0,
          {
            label: currentRoutes ? 'Dashboard' : 'Administrateur',
            action: currentRoutes ? routes.pages.home() : routes.pages.userOffice(),
          },
          // {
          //   label: currentRoutes ? 'Dashboard' : 'TrainingIA',
          //   action: currentRoutes
          //     ? routes.pages.home()
          //     : routes.pages.trainingIa(),
          // },
        );
      }

      return items;
    } else {
      return [
        { label: 'Se connecter', action: routes.pages.login() },
        { label: "S'enregistrer", action: routes.pages.register() },
      ];
    }
  }, [currentRoutes, session]);

  const handleSelect = useCallback(
    (v: string) => {
      if (v === 'logOut') {
        signOut({ redirect: true });
        return;
      }
      router.replace(v);
    },
    [router],
  );

  return (
    <Dropdown
      classNames={{
        content: 'lg:w-36 xl:w-44 min-w-0 bg-content border-1 border-border',
      }}
    >
      <DropdownTrigger>
        <div className="rounded-full w-[56%] h-[71.05%] cursor-pointer relative">
          <Image
            src="https://lh3.googleusercontent.com/pw/AP1GczMrbPszxKqTZW_JjfF1w_V9VkBqoo3zYDJLVAuiQL7VYEo5nDd71fYgwYHIVXfKZb4JKwUuJfXbM6KW_lQ-nag95x3pfGnJLbj86zUxx_T13NOUOVCoRN4hsF_8BsThF03AHLeJDXy_R03gZHkxi_or=w919-h919-s-no-gm?authuser=1"
            fill
            sizes="100%"
            alt="profil picture"
            className="rounded-full"
          />
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="select option" itemClasses={{ base: 'bg-content', title: '!text-p4' }}>
        {itemsDown?.map((itemsArr, i) => (
          <DropdownItem onPress={() => handleSelect(itemsArr.action)} key={i}>
            {itemsArr.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default NavbarAuth;
