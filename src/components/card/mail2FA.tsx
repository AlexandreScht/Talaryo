'use client';

import useAppContext from '@/hooks/providers/AppProvider';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast, SuccessToast } from '@/utils/toaster';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { startTransition, useCallback, useState } from 'react';
import Button from '../buttons';
import TimerBtn from '../buttons/timerBtn';
import OtpField from '../inputs/otp';

export default function Mail2FAConfig() {
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(0);
  const [otp, setOtp] = useState('');
  const router = useRouter();
  const { data: session } = useSession();

  const {
    stores: { setUserAnswerFor2FA },
    services: { askCode, activate2FA },
  } = useAppContext({ setLoading });

  const handleSendBackClick = useCallback(async () => {
    const { err, res } = await askCode();

    if (err || !res) {
      return ErrorToast({ text: undefined });
    }
    InfoToast({ text: "Votre code d'accès vous a été envoyé par email" });
    startTransition(() => setTimer(99));
  }, [askCode]);

  const handleSubmit = useCallback(async () => {
    if (otp?.length !== 6) return;

    const { err, res } = await activate2FA({
      otp: Number.parseInt(otp, 10),
      twoFactorType: 'email',
    });

    if (err || !res) {
      return ErrorToast({ error: err });
    }
    //? on next login, user will not be again on this page
    setUserAnswerFor2FA(true);
    SuccessToast({
      text: "Vous avez activé l'authentification à deux facteurs (2FA) avec succès. Vous allez être redirigé vers la page d'accueil",
      onClose: () => router.replace(routes.pages.home()),
      atCancel: () => router.replace(routes.pages.home()),
      time: 5000,
    });
  }, [activate2FA, otp, router, setUserAnswerFor2FA]);

  return !session?.user?.email ? (
    <div className="w-full mt-8 rounded-lg bg-errorDark px-1 py-2.5">
      <h1 className="text-errorTxt/80 font-medium text-center text-p1">
        Une erreur est survenue, veuillez essayer une autre methode
      </h1>
    </div>
  ) : (
    <div className="w-full px-3.5 lg:px-0 mt-4 lg:mt-7 mb-4">
      <p className="text-justify text-foreground/80 order-1 lg:order-2 text-p1 !leading-5 lg:!leading-8">
        Cliquez sur le bouton ci-dessous pour vous envoyer un{' '}
        <b>code d&apos;accès</b> à votre adresse mail:{' '}
        <b>{session.user.email}</b>. Saisissez ensuite le <b>code reçu</b> pour
        valider l&apos;authentification.
      </p>
      <OtpField
        otp={otp}
        setOtp={setOtp}
        digitNumber={6}
        classNames={{
          input: '!w-7',
          wrapper: 'justify-between my-6 lg:my-10 lg:justify-evenly',
        }}
      />
      <TimerBtn
        initialTimer={timer}
        setInitialTimer={setTimer}
        handleClick={handleSendBackClick}
        text="Envoyer le code"
        className="mb-7 mt-1.5"
      />
      <Button
        className={cn(
          '!text-p1 text-white relative w-full min-h-0 h-fit py-2.5 bg-primary rounded-lg border-1 border-border',
          {
            'bg-gradient-to-tr from-secondary font-medium to-special opacity-100 border-2 border-primary':
              otp.length === 6,
          },
        )}
        type="button"
        disabled={otp.length !== 6}
        isLoading={loading}
        onClick={handleSubmit}
      >
        Activer la methode 2FA
      </Button>
    </div>
  );
}
