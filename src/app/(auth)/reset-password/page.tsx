import ResetPasswordForm from '@/components/forms/reset-password';
import routes from '@/routes';
import { AuthView } from '@/views/auth';
import Link from 'next/link';

const ResetPassword = () => {
  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="md:w-11/12 h-full flex flex-col justify-center items-center mx-auto">
        <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
          <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">
            Réinitialiser mon mot de passe
          </h1>
          <span className="text-p1 text-asset">
            Saisissez l&#39;adresse mail liée à votre compte
          </span>
          <ResetPasswordForm />
        </section>
        <p className="mt-5 md:w-5/6 lg:w-[77%] xl:w-4/6 md:text-center lg:text-right text-p2 text-asset">
          Vous n&#39;avez pas encore de compte ?
          <Link
            href={routes.pages.register()}
            className="ml-2 text-secondary font-medium transition-transform hover:font-semibold"
          >
            S&#39;enregistrer
          </Link>
        </p>
      </div>
      <AuthView />
    </main>
  );
};

export default ResetPassword;
