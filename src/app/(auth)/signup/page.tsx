import RegisterForm from '@/components/forms/register';
import config from '@/config';
import nextAuthOptions from '@/config/authOption';
import routes from '@/routes';
import { AuthView } from '@/views/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function Register() {
  const session = await getServerSession(nextAuthOptions);
  if (session) {
    redirect(routes.pages.home());
  }
  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="w-11/12 h-full flex flex-col justify-center items-center mx-auto">
        <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
          <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">
            S&#39;enregistrer
          </h1>
          <span className="text-p1 text-asset">
            Un email vous sera envoyé afin de vérifier votre compte
          </span>
          <RegisterForm captchaKey={config.reCaptcha as string} />
        </section>
        <p className="mt-5 md:w-5/6 lg:w-[77%] xl:w-4/6 md:text-center lg:text-right text-p2 text-asset">
          Vous avez déjà un compte ?
          <Link
            href={routes.pages.login()}
            className="ml-2 text-secondary font-medium transition-transform hover:font-semibold"
          >
            Se connecter
          </Link>
        </p>
      </div>
      <AuthView />
    </main>
  );
}
