'use client';
import { Icons } from '@/assets/icons';
import routes from '@/routes';
import { ErrorToast } from '@/utils/toaster';
import { motion } from 'framer-motion';
import { OAuthProviderType } from 'next-auth/providers';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Button from './index';

export default function OAuthSign() {
  const [loading, setLoading] = useState<OAuthProviderType | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const oauthProviders = [
    { name: 'Google', strategy: 'google', icon: 'google' },
  ] satisfies {
    name: string;
    icon: keyof typeof Icons;
    strategy: OAuthProviderType;
  }[];

  const handleClick = useCallback(async (provider: OAuthProviderType) => {
    setLoading(provider);
    try {
      await signIn(provider);
    } catch (error) {
      setLoading(null);
      ErrorToast({ error });
    }
  }, []);

  useEffect(() => {
    const queries = Object.fromEntries(searchParams);
    if (!('error' in queries) || queries.error === 'Callback') {
      return;
    }

    router.prefetch(routes.pages.login());
    const message = decodeURIComponent(queries.error);
    ErrorToast({ text: message === 'AccessDenied' ? 'Accès refusé' : message });
    router.push(routes.pages.login());
  }, [router, searchParams]);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="duration-100 flex flex-col w-full items-center gap-3.5 lg:gap-7"
    >
      {oauthProviders.map((provider) => {
        const Icon = Icons[provider.icon];
        return (
          <div className="w-11/12" key={provider.name}>
            <Button
              onClick={() => void handleClick(provider.strategy)}
              className="!text-p1 bg-content text-secondary rounded-lg shadow-border relative maw-w-full w-full md:mt-5 md:mb-4 md:py-2.5 min-h-0 h-fit lg:mt-6 lg:mb-5 xl:mt-8 xl:mb-6 hover:border-gradient"
            >
              {loading === provider.strategy ? (
                <Icons.spinner
                  className="size-4 lg:size-6 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <>
                  <Icon
                    className="md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 -mr-2"
                    aria-hidden="true"
                  />
                  <span className="text-foreground">oogle</span>
                </>
              )}
            </Button>
          </div>
        );
      })}
    </motion.div>
  );
}
