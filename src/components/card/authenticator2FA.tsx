'use client';

import useAppContext from '@/hooks/providers/AppProvider';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast, SuccessToast } from '@/utils/toaster';
import clipboardCopy from 'clipboard-copy';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useRef, useState } from 'react';
import Button from '../buttons';
import OtpField from '../inputs/otp';

export default function Authenticator2FAConfig({
  base32,
  otpauth_url,
}: Required<speakeasyValues>) {
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState('');
  const QrCodeRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const {
    stores: { setUserAnswerFor2FA },
    services: { activate2FA },
  } = useAppContext({ token: base32, setLoading });

  const handleCopyQrCode = useCallback(async () => {
    if (QrCodeRef?.current && base32) {
      await clipboardCopy(base32);
      InfoToast({
        text: 'la clé de configuration a etait copier correctement',
      });
      QrCodeRef.current.classList.add('scale-110', 'opacity-50');

      setTimeout(() => {
        QrCodeRef?.current?.classList.remove('scale-110', 'opacity-50');
      }, 250);
    }
  }, [base32]);

  const handleSubmit = useCallback(async () => {
    if (otp?.length !== 6) return;

    const { err, res } = await activate2FA({
      otp: Number.parseInt(otp, 10),
      twoFactorType: 'authenticator',
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

  return (
    <>
      <div className="w-full px-3.5 lg:px-0 flex flex-col lg:block my-4 lg:my-7 float-end">
        <QRCodeSVG
          ref={QrCodeRef}
          onClick={handleCopyQrCode}
          className="w-24 transition-all cursor-pointer duration-250 lg:w-44 lg:-mr-4 mx-auto mt-1 lg:mt-0 aspect-square order-2 lg:order-1 float-right"
          value={otpauth_url}
        />
        <p className="text-justify text-foreground/80 order-1 lg:order-2 text-p1 !leading-5 lg:!leading-8">
          Scannez le QR code avec <b>Google Authenticator</b> ou cliquez sur le
          QR code pour copier la <b>clé de configuration</b> à entrer dans
          l&apos;application. Récupérez ensuite le <b>code d&apos;accès</b> et
          saisissez-le pour valider l&apos;authentification.
        </p>
      </div>

      <OtpField
        otp={otp}
        setOtp={setOtp}
        digitNumber={6}
        classNames={{
          input: '!w-7',
          wrapper: 'justify-between lg:justify-evenly my-10 lg:my-14',
        }}
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
    </>
  );
}
