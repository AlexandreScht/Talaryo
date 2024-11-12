'use client';

import { Icons } from '@/assets/icons';
import Button from '@/components/buttons';
import useAppContext from '@/hooks/providers/AppProvider';
import { twoFactorType } from '@/interfaces/services';
import routes from '@/routes';
import '@/styles/transition-group.css';
import cn from '@/utils/cn';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import speakeasy from 'speakeasy';
import Authenticator2FAConfig from './authenticator2FA';
import Mail2FAConfig from './mail2FA';

export default function FormTwoFactorAuthenticate() {
  const [method2FA, setMethod2FA] = useState<twoFactorType>();
  const [authenticator, setAuthenticator] = useState<speakeasyValues>();
  const cssRef = useRef(null);
  const router = useRouter();

  const {
    stores: { setTemporaryKey, getTemporaryKey, setUserAnswerFor2FA },
  } = useAppContext();

  useEffect(() => {
    //? recup value from tempory storage for not re create qrcode everytimes
    const speakeasyValues = getTemporaryKey<speakeasyValues>('2FA_values');

    if (speakeasyValues) {
      return setAuthenticator(speakeasyValues);
    }

    const { base32, otpauth_url } = speakeasy.generateSecret({
      name: 'Talaryo (2FA)',
    });
    setTemporaryKey<speakeasyValues>({
      storageName: '2FA_values',
      values: { base32, otpauth_url: otpauth_url },
    });
    setAuthenticator({ base32, otpauth_url: otpauth_url });
  }, [getTemporaryKey, setTemporaryKey]);

  const handleChooseEmail2FA = useCallback(
    () => setMethod2FA((v) => (v === 'email' ? undefined : 'email')),
    [],
  );
  const handleChooseAuth2FA = useCallback(
    () =>
      setMethod2FA((v) =>
        v === 'authenticator' ? undefined : 'authenticator',
      ),
    [],
  );

  const handleCancel = useCallback(() => {
    //? on next login, user will not be again on this page
    setUserAnswerFor2FA(true);
    router.replace(routes.pages.home());
  }, [router, setUserAnswerFor2FA]);

  return (
    <div className="w-full flex flex-col overflow-x-hidden mt-6 lg:mt-14">
      <h1 className="text-h2 text-foreground/75 text-center">
        Choissisez votre méthode 2FA preferer
      </h1>
      <div className="w-full flex flex-row justify-center space-x-8 lg:space-x-20 mt-7 lg:mt-11">
        <div
          onClick={handleChooseAuth2FA}
          className={cn(
            'w-[27%] lg:w-1/5 cursor-pointer hover:border-secondary/75 aspect-square border-1 border-foreground/40 rounded-lg',
            { 'bg-special/5 !border-secondary': method2FA === 'authenticator' },
          )}
        >
          <Icons.authenticator className="w-full p-4 lg:p-6 h-full text-default-400 pointer-events-none flex-shrink-0" />
        </div>
        <div
          onClick={handleChooseEmail2FA}
          className={cn(
            'w-[27%] lg:w-1/5 cursor-pointer aspect-square border-1 hover:border-secondary/75 border-foreground/40 rounded-lg',
            { 'bg-special/5 !border-secondary': method2FA === 'email' },
          )}
        >
          <Icons.MailIcon className="w-full p-4 lg:p-6 h-full text-default-400 pointer-events-none flex-shrink-0" />
        </div>
      </div>
      {!!method2FA && (
        <SwitchTransition>
          <CSSTransition
            key={method2FA}
            nodeRef={cssRef}
            classNames={method2FA === 'email' ? 'slide-left' : 'slide-right'}
            timeout={500}
            unmountOnExit
          >
            <div ref={cssRef}>
              {method2FA === 'authenticator' ? (
                <>
                  {authenticator?.otpauth_url && authenticator.base32 ? (
                    <Authenticator2FAConfig
                      {...(authenticator as Required<speakeasyValues>)}
                    />
                  ) : (
                    <div className="w-full mt-8 rounded-lg bg-errorDark px-1 py-2.5">
                      <h1 className="text-white font-medium text-center text-p1">
                        Une erreur est survenue, veuillez essayer une autre
                        methode
                      </h1>
                    </div>
                  )}
                </>
              ) : (
                <Mail2FAConfig />
              )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}
      <Button
        onClick={handleCancel}
        className="!text-p1 text-foreground/80 mt-8 lg:mt-10 relative w-full min-h-0 h-fit py-[0.6rem] bg-front rounded-lg border-2 border-secondary/80"
      >
        Je continue sans méthode 2FA
      </Button>
    </div>
  );
}
