import Button from '@/components/buttons';
import { role } from '@/interfaces/users';
import routes from '@/routes';
import { Metadata } from 'next';
import Link from 'next/link';
import { BsCheck2Circle } from 'react-icons/bs';

export const metadata: Metadata = {
  title: 'Paiement apcepter',
};

export default function SuccessfulPaid({
  searchParams,
}: {
  searchParams: { plan: role };
}) {
  return (
    <main>
      <div className="w-full h-full fixed top-0 bg-background">
        <div className="w-9/12 m-auto py-20 px-16 min-h-screen flex items-center justify-center">
          <div className="bg-content border border-asset/20 shadow overflow-hidden sm:rounded-lg pb-8 px-2">
            <div className="text-center pt-8 w-full">
              <h1 className="text-6xl font-bold text-secondary/70">
                Paiement reussi
              </h1>
              <div className="w-full flex justify-center">
                <BsCheck2Circle className="text-successTxt my-2 h-32 w-32" />
              </div>
              <p className="text-2xl mb-8 mt-6 mx-auto w-[85%] font-medium text-foreground/80">
                Vous êtes désormais abonné au plan{' '}
                <span className=" font-bold text-special">
                  {searchParams.plan}
                </span>{' '}
                et pourrez bénéficier de tous ses avantages dès maintenant.
              </p>
              <p className="text-xl mb-8 mt-6 mx-auto w-4/5 text-foreground/60">
                Un e-mail contenant toutes les informations relatives à votre
                abonnement ainsi que votre facture vous a été envoyé.
              </p>
              <div className="flex flex-row justify-center">
                <Link
                  href={routes.pages.home()}
                  className="text-primary text-lg font-bold"
                >
                  <Button className="w-auto outline-none bg-gradient-to-bl from-primary to-secondary/75 text-white font-semibold px-6 py-3 rounded-md">
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
