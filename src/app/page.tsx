import OAuthSign from '@/components/buttons/oAuth';
import LoginForm from '@/components/forms/login';
import config from '@/config';
import nextAuthOptions from '@/config/authOption';
import routes from '@/routes';
import { AuthView } from '@/views/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Login() {
  const session = await getServerSession(nextAuthOptions);

  if (session) {
    redirect(routes.pages.home());
  }
  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="w-full h-full flex justify-center items-center flex-col">
        <div className="w-11/12 h-full flex flex-col justify-center items-center">
          <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
            <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">Se Connecter</h1>
            <span className="text-p1 text-asset">Seuls les comptes validés par e-mail peuvent se connecter</span>
            <OAuthSign />
            <div className="w-full flex flex-row mt-2 mb-2 lg:mb-4 justify-center items-center">
              <div className="bg-asset/80 rounded-md h-1 w-full opacity-50"></div>
              <span className="mx-4 text-center text-h3 text-secondary font-bold">Ou</span>
              <div className="bg-asset/80 rounded-md h-1 w-full opacity-50"></div>
            </div>
            <LoginForm captchaKey={config.reCaptcha as string} />
          </section>
          <p className="md:mt-5 md:w-5/6 lg:w-[77%] xl:w-4/6 md:text-center lg:text-right text-p2 text-asset">
            Vous n&#39;avez pas encore de compte ?
            <Link href={routes.pages.register()} className="ml-2 text-secondary font-medium transition-transform hover:font-semibold">
              S&#39;enregistrer
            </Link>
          </p>
        </div>
      </div>
      <AuthView />
    </main>
  );
}
