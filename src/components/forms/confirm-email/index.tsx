'use client';

import Button from '@/components/buttons';
import TimerBtn from '@/components/buttons/timerBtn';
import OtpField from '@/components/inputs/otp';
import useAppContext from '@/hooks/providers/AppProvider';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, SuccessToast } from '@/utils/toaster';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { startTransition, useCallback, useState } from 'react';

export default function MailConfirmationForm() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const {
    services: { askCode, validateAccount },
  } = useAppContext({ setLoading });

  const handleSendBackClick = useCallback(async () => {
    const { err, res } = await askCode();

    if (err || !res) {
      return ErrorToast({ error: err });
    }
    startTransition(() => setTimer(99));
  }, [askCode]);

  const handleValidAccountClick = useCallback(async () => {
    const { err, res } = await validateAccount(Number.parseInt(otp, 10));

    if (err || !res) {
      if (
        err instanceof AxiosError &&
        err.status === 422 &&
        err.response?.data?.error === 'expired'
      ) {
        return ErrorToast({
          text: "Votre code d'accès a expiré. Veuillez en demander un nouveau",
        });
      }
      return ErrorToast({ error: err });
    }
    SuccessToast({
      text: res,
      onClose: () => router.replace(routes.pages.login()),
      atCancel: () => router.replace(routes.pages.login()),
    });
  }, [otp, router, validateAccount]);

  return (
    <>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full duration-100"
      >
        <div className="w-full border-2 bg-asset/5 shadow-inner border-content/60 mb-4 lg:mb-6 mt-10 lg:mt-14 h-fit py-4 px-14 rounded-lg flex flex-col items-center">
          <h1 className="text-h2 font-medium text-foreground/75 text-center mb-6 lg:mb-8">
            Entrer votre code d&#39;activation
          </h1>
          <OtpField otp={otp} setOtp={setOtp} shouldAutoFocus />
          <div className="w-full lg:w-4/5 mt-7 lg:mt-14 flex space-y-4 lg:space-y-6 flex-col">
            <TimerBtn
              initialTimer={timer}
              setInitialTimer={setTimer}
              handleClick={handleSendBackClick}
            />
            <Button
              className={cn(
                '!text-p1 text-white relative w-full min-h-0 h-fit py-2.5 bg-primary rounded-lg border-1 border-border',
                {
                  'bg-gradient-to-tr from-secondary to-special opacity-100 border-2 border-primary':
                    otp.length === 4,
                },
              )}
              type="button"
              disabled={otp.length !== 4}
              isLoading={loading}
              onClick={handleValidAccountClick}
            >
              Valider votre compte
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
