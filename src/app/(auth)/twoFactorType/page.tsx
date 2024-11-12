import FormTwoFactorAuthenticate from '@/components/card/twoFactorAuthenticate';
import { AuthView } from '@/views/auth';

export default async function TwoFactorType() {
  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="md:w-11/12 h-full flex flex-col justify-center items-center mx-auto">
        <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
          <h1 className="text-h1 w-full text-center text-gradient font-semibold lg:font-bold">
            Authentification à deux facteur (2FA)
          </h1>
          <p className="text-p1 w-full mt-2 text-center text-asset">
            Souhaitez-vous configurer une méthode d&apos;authentification à deux
            facteurs (2FA) pour sécuriser davantage votre compte ?
          </p>
          <FormTwoFactorAuthenticate />
        </section>
      </div>
      <AuthView />
    </main>
  );
}
