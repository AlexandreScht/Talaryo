'use client';

import Button from '@/components/buttons';
import InputField from '@/components/inputs/field';
import useAppContext from '@/hooks/providers/AppProvider';
import type { NewPasswordFormType } from '@/interfaces/services';
import { NewPasswordSchemaValidator } from '@/libs/valideModules';
import routes from '@/routes';
import cn from '@/utils/cn';
import { ErrorToast, SuccessToast } from '@/utils/toaster';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

const NewPasswordForm = ({ resetCode }: { resetCode: string }) => {
  const router = useRouter();
  const {
    services: { resetPassword },
  } = useAppContext({ token: resetCode });

  const initialValues: NewPasswordFormType = {
    password: '',
    confirm: '',
  };

  const handleSubmit = useCallback(
    async (FormValues: NewPasswordFormType) => {
      const { err, res: text } = await resetPassword(FormValues);
      if (!err && !text) {
        return ErrorToast({ error: err });
      }

      SuccessToast({
        text,
        onClose: () => router.replace(routes.pages.login()),
        atCancel: () => router.replace(routes.pages.login()),
        time: 5000,
      });
    },
    [router],
  );

  return (
    <>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full duration-100"
      >
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={NewPasswordSchemaValidator}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col md:mt-2 lg:mt-3 xl:mt-4">
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
                classNames={{
                  errorMessage: 'p-1 pt-0.5 !text-p4 text-errorTxt/90',
                  label: '!text-p3 text-foreground/80 overflow-visible',
                  base: 'mb-2.5 lg:mb-3 xl:mb-4 px-0.5 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                  input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                  innerWrapper: 'p-0 !bg-content !border-none',
                  inputWrapper:
                    'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
                  endContents: [
                    'text-foreground/90 md:h-6 lg:h-7',
                    'text-foreground/90 md:h-7 lg:h-7',
                  ],
                }}
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
                classNames={{
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
                }}
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
                Réinitialiser mon mot de passe
              </Button>
            </Form>
          )}
        </Formik>
      </motion.div>
    </>
  );
};

export default NewPasswordForm;
