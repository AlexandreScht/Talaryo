import NavbarAuth from '@/components/menu/profil';
import ToggleThemeSwitcher from '@/components/themes/themeSwitcher';
import authOptions from '@/config/authOption';
import { getServerSession, Session } from 'next-auth';

import BadgeNotification from './Badge';
import BadgeInformation from './Information';

const DefaultNavbar = async () => {
  const { user: User } =
    ((await getServerSession(authOptions)) as Session) || {};

  return (
    <nav className="md:w-40 md:h-12 lg:w-48 lg:h-14 xl:w-56 xl:h-16 z-40 rounded-2xl lg:rounded-full bg-content fixed md:right-16 lg:right-28 xl:right-32 top-5 shadow-sm shadow-shadow grid pr-1 pl-3 lg:pl-4 grid-cols-5 grid-rows-1 items-center">
      <div className="w-full h-full flex justify-center items-center col-span-1">
        <div className="w-full h-3/5 border-1 border-content hover:border-border rounded-md cursor-pointer p-[0.3rem] lg:p-1 xl:p-1">
          <BadgeNotification />
        </div>
      </div>
      <div className="w-full h-full flex justify-center items-center col-span-1">
        <ToggleThemeSwitcher className="w-full h-3/5 border-1 border-content hover:border-border rounded-md cursor-pointer p-1.5 xl:p-1.5" />
      </div>
      <div className="w-full h-full flex justify-center items-center col-span-1">
        <div className="w-full h-3/5 border-1 border-content hover:border-border rounded-md cursor-pointer p-1.5 xl:p-1.5">
          <BadgeInformation />
        </div>
      </div>
      <div className="w-full h-full selection:bg-transparent ml-0.5 lg:ml-0 flex items-center justify-center col-span-2">
        <NavbarAuth session={User} />
      </div>
    </nav>
  );
};

export default DefaultNavbar;
