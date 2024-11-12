import Button from '@/components/buttons';
import routes from '@/routes';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Not Found',
};

export default function NotFound() {
  return (
    <main>
      <div className="w-full h-full fixed top-0 bg-background">
        <div className="w-9/12 m-auto py-20 px-16 min-h-screen flex items-center justify-center">
          <div className="bg-content border border-asset/20 shadow overflow-hidden sm:rounded-lg pb-8 px-2">
            <div className="text-center pt-8 w-full">
              <h1 className="text-6xl font-bold text-secondary/70">Page Introuvable</h1>
              <p className="text-2xl mb-8 mt-6 mx-auto w-4/5 font-medium text-foreground/90">
                La page à laquelle vous essayez d&#39;accéder n&#39;existe pas, veuillez revenir à la page d&#39;accueil.
              </p>
              <div className="flex flex-row justify-center">
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
