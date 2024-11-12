import Button from '@/components/buttons';
import routes from '@/routes';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Not Authorized',
};

export default function UnAuthorized() {
  return (
    <main>
      <div className="w-full h-full fixed top-0 bg-background">
        <div className="w-9/12 m-auto py-20 px-16 min-h-screen flex items-center justify-center">
          <div className="bg-content border border-asset/20 shadow overflow-hidden sm:rounded-lg pb-8 px-2">
            <div className="text-center pt-8 w-full">
              <h1 className="text-6xl font-bold text-secondary/70">Permissions insuffisantes</h1>
              <p className="text-2xl mb-8 mt-6 mx-auto w-4/5 font-medium text-foreground/90">
                Vous n&#39;avez pas la permission d&#39;accéder à cette page. Veuillez souscrire à l&#39;abonnement adéquat ou revenir à la page
                d&#39;accueil.
              </p>
              <div className="flex flex-row justify-center">
                <Link href={routes.pages.billing()} className="text-primary text-lg font-bold mr-5">
                  <Button className="w-auto outline-none bg-gradient-to-bl from-primary to-secondary/75 text-white font-semibold px-6 py-3 rounded-md">
                    Souscrire
                  </Button>
                </Link>
                <Link href={routes.pages.home()} className="text-primary text-lg font-bold">
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
