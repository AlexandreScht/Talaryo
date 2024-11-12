import NewPasswordForm from '@/components/forms/reset-password/reset';
import routes from '@/routes';
import getSessionCookie from '@/utils/cookies';
import { AuthView } from '@/views/auth';
import Link from 'next/link';

const ResetPassword = async ({
  searchParams: { resetCode },
}: {
  searchParams: { resetCode: string };
}) => {
  const cookieSetting = await getSessionCookie('reset_cookie');

  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="md:w-11/12 lg:w-5/6 h-full flex flex-col justify-center items-center mx-auto">
        {!cookieSetting || !resetCode ? (
          <section className="md:w-5/6 flex flex-col lg:w-[77%] xl:w-4/6">
            <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">
              Mauvais liens
            </h1>
            <span className="text-p1 text-asset">
              Il semble que votre lien soit erroné ou invalide
            </span>
            <Link
              className="!text-p1 text-foreground/90 hover:text-white text-center relative w-full mt-5 py-2.5 bg-transparent rounded-lg hover:bg-gradient-to-tr from-secondary to-special/80 opacity-100 border-2 border-secondary hover:border-primary"
              href={routes.pages.password()}
            >
              Demander un nouveau lien de réinitialisation
            </Link>
          </section>
        ) : (
          <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
            <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">
              Réinitialiser mon mot de passe
            </h1>
            <span className="text-p1 text-asset">
              Saisissez votre nouveau mot de passe
            </span>
            <NewPasswordForm resetCode={resetCode} />
          </section>
        )}
      </div>
      <AuthView />
    </main>
  );
};

export default ResetPassword;
