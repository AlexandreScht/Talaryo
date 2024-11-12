import MailConfirmationForm from '@/components/forms/confirm-email';
import routes from '@/routes';
import { AuthView } from '@/views/auth';
import Link from 'next/link';

export default function MailConfirmation() {
  return (
    <main className="w-full h-screen grid grid-cols-2 grid-rows-1">
      <div className="md:w-11/12 h-full flex flex-col justify-center items-center mx-auto">
        <section className="md:w-5/6 lg:w-[77%] xl:w-4/6">
          <h1 className="text-h1 text-left text-gradient font-semibold lg:font-bold">
            Valider votre compte Talaryo
          </h1>
          <span className="text-p1 text-asset">
            Saisissez le code envoyé par mail
          </span>
          <MailConfirmationForm />
        </section>
        <p className="mt-5 md:w-5/6 lg:w-[77%] xl:w-4/6 md:text-center lg:text-right text-p2 text-asset">
          Vous n&#39;avez pas fait de demande ?
          <Link
            href={routes.pages.login()}
            className="ml-2 text-secondary font-medium transition-transform hover:font-semibold"
          >
            s'enregistrer
          </Link>
        </p>
      </div>
      <AuthView />
    </main>
  );
}
