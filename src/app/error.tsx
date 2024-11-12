'use client';

import Button from '@/components/buttons';
import routes from '@/routes';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'error',
};

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const expired = error.message === 'Votre token a expiré';

  return (
    <main>
      <div className="w-full h-full fixed top-0 bg-background">
        <div className="w-9/12 m-auto py-20 px-16 min-h-screen flex items-center justify-center">
          <div className="bg-content border border-asset/20 shadow overflow-hidden sm:rounded-lg pb-8 px-2">
            <div className="text-center pt-8 w-full flex flex-col items-center">
              <h1 className="text-8xl font-bold text-secondary/70">Erreur</h1>
              <p className="text-4xl font-medium mb-10 mt-4 w-11/12">
                {error.message}
              </p>
              <p className="text-xl mb-8 mx-auto w-4/5 font-medium text-foreground/90">
                {expired
                  ? 'Veuillez vous reconnecter ou contacter le support si le problème persiste.'
                  : 'Veuillez réessayer ultérieurement ou contacter le support si le problème persiste.'}
              </p>
              <div className="flex flex-row justify-center">
                <Button
                  onClick={() => reset()}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-md mr-6"
                >
                  Try again
                </Button>
                <Link
                  href={expired ? routes.pages.login() : routes.pages.home()}
                  className="text-primary text-lg font-bold"
                >
                  <Button className="w-auto outline-none bg-gradient-to-bl from-primary to-secondary/75 text-white font-semibold px-6 py-3 rounded-md">
                    {expired ? 'Login' : 'Home'}
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
