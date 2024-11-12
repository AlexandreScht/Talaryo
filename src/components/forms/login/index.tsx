'use client';

import Button from '@/components/buttons';
import InputField from '@/components/inputs/field';
import OtpField from '@/components/inputs/otp';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { loginForm } from '@/interfaces/services';
import { loginSchemaValidator } from '@/libs/valideModules';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast } from '@/utils/toaster';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

const LoginForm = ({ captchaKey }: { captchaKey: string }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [twoFactorAuthenticate, setTwoFactorAuthenticate] = useState<boolean>(false);
  const [otp, setOtp] = useState('');

  const {
    stores: { getUserAnswerFor2FA },
  } = useAppContext();

  const initialValues = useMemo(
    () => ({
      email: '',
      password: '',
    }),
    [],
  );
  const reRef = useRef<ReCAPTCHA | null>(null);

  const handleValidate2FA = useCallback(async () => {
    try {
      setLoading(true);
      const res = await signIn('credentials', {
        otp,
        redirect: false,
      });

      if (res && !res.error && res.status === 200 && res.ok) {
        return router.replace(routes.pages.home());
      }
      return ErrorToast({ error: res?.error });
    } catch (error) {
      ErrorToast({ error: error });
    } finally {
      setLoading(false);
    }
  }, [otp, router]);

  const handleSubmit = useCallback(
    async (FormValues: loginForm) => {
      try {
        const token = (await reRef.current?.executeAsync()) || null;
        if (!token) throw new ClientException(500, 'Erreur interne, veuillez réessayer plus tard');

        reRef.current?.reset();

        const res = await signIn('credentials', {
          ...FormValues,
          token,
          redirect: false,
        });

        if (res && !res.error && res.status === 200 && res.ok) {
          return router.replace(getUserAnswerFor2FA() ? routes.pages.home() : routes.pages.twoFactorType());
        }

        if (res?.error && ['authenticator', 'email'].includes(res.error)) {
          return setTwoFactorAuthenticate(true);
        }

        return ErrorToast({ error: res?.error });
      } catch (err) {
        ErrorToast({ error: err });
      }
    },
    [getUserAnswerFor2FA, router],
  );

  return (
    <>
      {twoFactorAuthenticate ? (
        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full duration-100">
          <p className="text-center rounded-md p-2 mb-5 lg:mb-6 xl:mb-7 mt-1.5 lg:mt-2 xl:mt-2.5 py-2 lg:py-3 xl:p-3.5 !text-h4 bg-content border-foreground/10 border-1 text-foreground/80">
            Votre compte utilise l&#39;authentification à deux facteurs. Veuillez Entrez le code pour compléter la connexion.
          </p>

          <OtpField
            otp={otp}
            shouldAutoFocus
            setOtp={setOtp}
            digitNumber={6}
            classNames={{
              input: '!w-7',
              wrapper: 'justify-between lg:justify-evenly',
            }}
          />
          <Button
            className={cn(
              '!text-p1 text-white relative w-full mt-8 lg:mt-9 xl:mt-10 min-h-0 h-fit py-2 bg-primary rounded-lg border-1 border-border',
              {
                'bg-gradient-to-tr from-secondary font-medium to-special opacity-100 border-2 border-primary': otp.length === 6,
              },
            )}
            type="button"
            disabled={otp.length !== 6}
            isLoading={loading}
            onClick={handleValidate2FA}
          >
            Valider
          </Button>
        </motion.div>
      ) : (
        <>
          {' '}
          <ReCAPTCHA theme={theme as 'dark' | 'light'} sitekey={captchaKey} size="invisible" ref={ref => (reRef.current = ref) as any} />
          <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full duration-100">
            <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={loginSchemaValidator}>
              {({ isValid, dirty, isSubmitting }) => (
                <Form className="flex flex-col md:mt-2 lg:mt-3 xl:mt-4">
                  <InputField
                    type="email"
                    name="email"
                    label="Email"
                    fullWidth
                    isClearable
                    radius="sm"
                    required
                    onTouchClass="scale-85 mt-1.5 lg:mt-0.5"
                    labelPlacement="outside"
                    classNames={{
                      label: '!text-p3 text-foreground/80 overflow-visible',
                      base: 'mb-2.5 lg:mb-3 xl:mb-4 px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                      input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                      innerWrapper: 'p-0 !bg-content !border-none',
                      inputWrapper: 'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                    }}
                  />

                  <InputField
                    type="password"
                    name="password"
                    label="Password"
                    fullWidth
                    radius="sm"
                    required
                    labelPlacement="outside"
                    onTouchClass="scale-85 mt-1.5 lg:mt-0.5"
                    endContents={[VscEye, VscEyeClosed]}
                    classNames={{
                      label: '!text-p3 text-foreground/80 overflow-visible',
                      base: 'mb-2.5 lg:mb-3 xl:mb-4 px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                      input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                      innerWrapper: 'p-0 !bg-content !border-none',
                      inputWrapper: 'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                      endContents: ['text-foreground/90 md:h-6 lg:h-7', 'text-foreground/90 md:h-7 lg:h-7'],
                    }}
                  />
                  <div className="w-full text-h4 text-right mb mb-4 xl:mb-6">
                    <Link href={routes.pages.password()} className="w-fit text-asset hover:text-secondary">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    className={cn('!text-p1 text-white relative w-full min-h-0 h-fit py-2 bg-primary rounded-lg border-1 border-border', {
                      'bg-gradient-to-tr from-secondary font-medium to-special opacity-100 border-2 border-primary': dirty && isValid,
                    })}
                    type="submit"
                    disabled={!(dirty && isValid)}
                    isLoading={isSubmitting}
                  >
                    Se connecter
                  </Button>
                </Form>
              )}
            </Formik>
          </motion.div>
        </>
      )}
    </>
  );
};

export default LoginForm;
