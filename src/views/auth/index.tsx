import LogoSVG from '@/assets/talaryo';
import Image from 'next/image';
// import Image from 'next/image';
// import { RiShieldCheckFill } from 'react-icons/ri';

export const AuthView = () => {
  return (
    <div className="rounded-bl-[6rem] relative overflow-hidden w-full h-full flex justify-center items-center flex-col bg-authBg bg-cover bg-center bg-no-repeat">
      <Image
        alt="auth bg"
        src="https://lh3.googleusercontent.com/pw/AP1GczP34T1FJQ41l9kXOi9uEc4a7GGGE1CVQF01wJ9VX4NH2fWF7NPz42fQmAept9Fv8wzj8Q-LipjLREz6piB69u6qEqx_e4gJExPL5FvzeOw3FHPQX3OcuufoszhTGAahY_NugCrLGDkSxAUiJg2UMexz=w770-h919-s-no-gm?authuser=1"
        fill
        sizes="100%"
        className="absolute -z-10"
      />
      <div className="w-2/5 mb-10">
        <LogoSVG animate />
      </div>
      <footer className="bottom-2 absolute">
        <ul className="flex md:w-5/6 lg:w-[95%] xl:w-full md:ml-6 lg:ml-3 xl:ml-0 text-p4 md:space-x-8 lg:space-x-6 xl:space-x-10 flex-row text-center text-white">
          <li className="hover:font-medium md:w-20 lg:w-fit cursor-pointer">
            Mentions legales
          </li>
          <li className="hover:font-medium md:w-20 lg:w-fit cursor-pointer">
            Condition d&#39;utilisation
          </li>
          <li className="hover:font-medium md:w-20 lg:w-fit cursor-pointer">
            Politique de cookies
          </li>
          <li className="hover:font-medium md:w-20 lg:w-fit cursor-pointer">
            politique de confidentialité
          </li>
        </ul>
      </footer>
    </div>
  );
};
