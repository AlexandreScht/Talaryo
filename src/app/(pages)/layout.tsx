import LogoSVG from '@/assets/talaryo';
import LayoutChoice from '@/components/navigations/layoutChoice';
import { LayoutLink } from '@/components/navigations/layoutLink';
import nextAuthOptions from '@/config/authOption';
import { externeItems, menuItems } from '@/interfaces/layout';
import routes from '@/routes';
import { getServerSession, Session } from 'next-auth';
import { AiOutlineCloud, AiOutlineStar } from 'react-icons/ai';
import { BiCalendarCheck, BiHomeAlt2, BiNews } from 'react-icons/bi';
import { FiCompass } from 'react-icons/fi';
import { MdAccountBalance, MdOutlineSell } from 'react-icons/md';

const PageLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = (await getServerSession(nextAuthOptions)) as Session;

  const { user: User } = session;

  const menuItems: menuItems[] = [
    {
      icon: <BiHomeAlt2 />,
      label: 'Home',
      route: routes.pages.home(),
      plan: 'free',
    },
    {
      icon: <FiCompass />,
      label: 'Réseaux pro',
      route: [routes.pages.pro(), routes.pages.candidats.reseauxResult()],
      plan: 'free',
    },
    {
      icon: <AiOutlineCloud />,
      label: 'Cv',
      route: [routes.pages.cv(), routes.pages.candidats.cvResult()],
      plan: 'pro',
    },
    {
      icon: <AiOutlineStar />,
      label: 'Favoris',
      route: routes.pages.favoris(),
      plan: 'free',
    },
    {
      icon: <BiCalendarCheck />,
      label: 'Recherches',
      route: routes.pages.searches(),
      plan: 'free',
    },
  ];

  const externeItems: externeItems[] = [
    {
      icon: <MdAccountBalance />,
      label: User?.role !== 'free' ? 'Changer de Plan' : 'Souscrire à un Plan',
      route: routes.pages.billing(),
    },
    { icon: <BiNews />, label: 'Les actus', route: routes.pages.news() },
    { icon: <MdOutlineSell />, label: 'blog', route: routes.pages.blog() },
  ];

  const Positions = {
    [routes.pages.home()]: 'md:-top-[5%] lg:-top-[5%] xl:-top-[7.25%]',
    [routes.pages.pro()]: 'md:top-[16.25%] lg:top-[16.15%] xl:top-[14%]',
    [routes.pages.candidats.reseauxResult()]: 'md:top-[16.25%] lg:top-[16.15%] xl:top-[14%]',
    [routes.pages.cv()]: 'md:top-[37.5%] lg:top-[37.5%] xl:top-[36.5%]',
    [routes.pages.candidats.cvResult()]: 'md:top-[37.5%] lg:top-[37.5%] xl:top-[36.5%]',
    [routes.pages.favoris()]: 'md:top-[59.5%] lg:top-[59.5%] xl:top-[58%]',
    [routes.pages.searches()]: 'md:top-[81.5%] lg:top-[80%] xl:top-[80.5%]',
  };

  return (
    <div className="flex flex-row">
      <nav className="fixed top-0 bg-content md:w-44 lg:w-60 xl:w-[17rem] h-screen flex flex-col">
        <div className="w-7/12 lg:w-4/6 mx-auto mt-5 relative -left-0.5 lg:left-0 xl:-left-2">
          <LogoSVG className="fill-logo" />
        </div>
        <LayoutLink User={User} menuItems={menuItems}>
          <LayoutChoice Positions={Positions} />
        </LayoutLink>
        <span className="bg-asset/50 w-5/6 mt-10 h-1 mx-auto"></span>
        <LayoutLink User={User} externeItems={externeItems} />
      </nav>
      <main className="w-full md:ml-40 lg:ml-60 xl:ml-[17rem] h-full pt-7 lg:pt-6 xl:pt-10">
        <div className="md:px-16 lg:pl-20 lg:pr-28 xl:pl-28 xl:pr-32 h-full">{children}</div>
      </main>
    </div>
  );
};
export default PageLayout;
