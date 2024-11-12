'use client';

import Button from '@/components/buttons';
import InputField from '@/components/inputs/field';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import type { AuthFormType, registerForm } from '@/interfaces/services';
import { registerSchemaValidator } from '@/libs/valideModules';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast } from '@/utils/toaster';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

const RegisterForm = ({ captchaKey }: { captchaKey: string }) => {
  const { theme } = useTheme();
  const reRef = useRef<ReCAPTCHA | null>(null);
  const router = useRouter();
  const {
    services: { register },
  } = useAppContext();

  const initialValues: AuthFormType = {
    email: 'alexandreschecht@gmail.com',
    firstName: 'sqdsq',
    lastName: 'dsd',
    password: 'MyPassword08!',
    confirm: 'MyPassword08!',
  };

  const handleSubmit = useCallback(
    async (FormValues: registerForm) => {
      try {
        const token = (await reRef.current?.executeAsync()) || null;
        if (!token)
          throw new ClientException(
            500,
            'Erreur interne, veuillez réessayer plus tard',
          );

        const { err, res } = await register<registerForm & { token: string }>({
          ...FormValues,
          token,
        });
        reRef.current?.reset();

        if (err || !res) {
          return ErrorToast({ error: err });
        }
        router.replace(routes.pages.signup.confirmEmail());
      } catch (error) {
        ErrorToast({ text: 'test du toas info' });
      }
    },
    [register, router],
  );

  return (
    <>
      <ReCAPTCHA
        theme={theme as 'dark' | 'light'}
        sitekey={captchaKey}
        size="invisible"
        ref={(ref) => (reRef.current = ref)}
      />
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full duration-100"
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={registerSchemaValidator}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col md:mt-2.5 lg:mt-3 xl:mt-4">
              <InputField
                type="email"
                name="email"
                label="Email"
                fullWidth
                isClearable
                radius="sm"
                required
                onTouchClass="scale-85 mt-1"
                labelPlacement="outside"
                classNames={
                  {
                    label: '!text-p3 text-foreground/80 overflow-visible',
                    base: 'px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                    input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                    innerWrapper: 'p-0 !bg-content !border-none',
                    inputWrapper:
                      'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                  } as any
                }
              />

              <div className=" grid grid-cols-2 gap-4 w-full my-2 lg:my-2.5 xl:my-3">
                <InputField
                  type="text"
                  name="firstName"
                  label="Prénom"
                  fullWidth
                  isClearable
                  radius="sm"
                  required
                  labelPlacement="outside"
                  onTouchClass="scale-85 mt-1"
                  classNames={
                    {
                      label: '!text-p3 text-foreground/80 overflow-visible',
                      base: 'px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                      input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                      innerWrapper: 'p-0 !bg-content !border-none',
                      inputWrapper:
                        'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                    } as any
                  }
                />

                <InputField
                  type="text"
                  name="lastName"
                  label="Nom"
                  fullWidth
                  isClearable
                  radius="sm"
                  required
                  labelPlacement="outside"
                  onTouchClass="scale-85 mt-1"
                  classNames={
                    {
                      label: '!text-p3 text-foreground/80 overflow-visible',
                      base: 'px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                      input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                      innerWrapper: 'p-0 !bg-content !border-none',
                      inputWrapper:
                        'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                    } as any
                  }
                />
              </div>

              <InputField
                type="password"
                name="password"
                label="Password"
                fullWidth
                radius="sm"
                required
                endContents={[VscEye, VscEyeClosed]}
                showError
                labelPlacement="outside"
                onTouchClass="scale-85 mt-1"
                classNames={
                  {
                    errorMessage: 'p-1 pt-0.5 !text-p4 text-errorTxt/90',
                    label: '!text-p3 text-foreground/80 overflow-visible',
                    base: 'mb-2 lg:mb-2.5 xl:mb-3 px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                    input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                    innerWrapper: 'p-0 !bg-content !border-none',
                    inputWrapper:
                      'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                    endContents: [
                      'text-foreground/90 md:h-6 lg:h-7',
                      'text-foreground/90 md:h-7 lg:h-7',
                    ],
                  } as any
                }
              />

              <InputField
                type="password"
                name="confirm"
                label="Confirm Password"
                fullWidth
                radius="sm"
                required
                endContents={[VscEye, VscEyeClosed]}
                showError
                autoComplete="off"
                labelPlacement="outside"
                onTouchClass="scale-85 mt-1"
                classNames={
                  {
                    errorMessage: 'p-1 pt-0.5 !text-p4 text-errorTxt/90',
                    label: '!text-p3 text-foreground/80 overflow-visible',
                    base: 'mb-5 lg:mb-6 xl:mb-8 px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                    input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                    innerWrapper: 'p-0 !bg-content !border-none',
                    inputWrapper:
                      'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                    endContents: [
                      'text-foreground/90 md:h-6 lg:h-7',
                      'text-foreground/90 md:h-7 lg:h-7',
                    ],
                  } as any
                }
              />

              <Button
                className={cn(
                  '!text-p1 text-white relative w-full min-h-0 h-fit py-2 bg-primary rounded-lg border-1 border-border',
                  {
                    'bg-gradient-to-tr from-secondary to-special opacity-100 border-2 border-primary':
                      dirty && isValid,
                  },
                )}
                type="submit"
                disabled={!(dirty && isValid)}
                isLoading={isSubmitting}
              >
                S&#39;enregistrer
              </Button>
            </Form>
          )}
        </Formik>
      </motion.div>
    </>
  );
};

export default RegisterForm;
