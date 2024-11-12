'use client';

import { HomeCard as props } from '@/interfaces/home';
import { role, userPayload } from '@/interfaces/users';
import { roleAccess } from '@/middlewares/autorisation';
import { InfoToast } from '@/utils/toaster';
import Link from 'next/link';
import { useCallback } from 'react';

const HomeCard = ({ icon, title, desc, txt, pack, role, route }: props) => {
  const handleClick = useCallback(() => {
    InfoToast({
      text: `Cette fonctionnalité est disponible à partir de l'abonnement ${pack.charAt(0).toUpperCase() + pack.slice(1)}`,
    });
  }, [pack]);

  return roleAccess(
    pack.toLowerCase() as role,
    {
      role,
    } as userPayload,
  ) ? (
    <Link href={route} className="hover:card-shadow-gradient rounded-lg h-60 lg:h-[18.5rem] xl:h-96">
      <div className="bg-content border-1 flex flex-col border-asset/20 rounded-xl w-full h-full md:p-4 lg:p-6 xl:p-7">
        <div className="w-full md:h-[60%] lg:h-4/6  rounded-xl bg-gradient-to-tr from-secondary to-special flex items-center justify-center flex-col">
          <div className="md:w-3/6 lg:w-4/6 md:h-3/6 lg:h-4/6 text-white flex justify-center items-center">{icon}</div>
          <span className="text-h2 font-semibold mt-2 lg:mt-1 md:mb-3 lg:mb-5 text-white">{title}</span>
        </div>
        <div className="w-full flex flex-col flex-1 px-1 xl:px-2 md:mt-3.5 lg:mt-4 xl:mt-5">
          <h3 className="md:mb-2.5 xl:mb-3 font-medium text-foreground/80 text-p1">{desc}</h3>
          <span className="text-asset text-p3">{txt}</span>
          <p className="mt-auto mb-0 lg:mt-0 xl:mt-2 w-full text-p4 text-right text-gradient font-bold lg:font-semibold">Pack {pack}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div onClick={handleClick} className="hover:card-shadow-gradient rounded-lg h-60 lg:h-[18.5rem] xl:h-96 opacity-75 hover:cursor-not-allowed">
      <div className="bg-content border-1 flex flex-col border-asset/20 rounded-xl w-full h-full md:p-4 lg:p-6 xl:p-7">
        <div className="w-full md:h-[60%] lg:h-4/6  rounded-xl bg-gradient-to-tr from-secondary to-special flex items-center justify-center flex-col">
          <div className="md:w-3/6 lg:w-4/6 md:h-3/6 lg:h-4/6 text-white flex justify-center items-center">{icon}</div>
          <span className="text-h2 font-semibold mt-2 lg:mt-1 md:mb-3 lg:mb-5 text-white">{title}</span>
        </div>
        <div className="w-full flex flex-col flex-1 px-1 xl:px-2 md:mt-3.5 lg:mt-4 xl:mt-5">
          <h3 className="md:mb-2.5 xl:mb-3 font-medium text-foreground/80 text-p1">{desc}</h3>
          <span className="text-asset text-p3">{txt}</span>
          <p className="mt-auto mb-0 lg:mt-0 xl:mt-2 w-full text-p4 text-right text-gradient font-bold lg:font-semibold">Pack {pack}</p>
        </div>
      </div>
    </div>
  );
};

export default HomeCard;
