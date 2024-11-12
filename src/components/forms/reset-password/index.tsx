'use client';

import Button from '@/components/buttons';
import InputField from '@/components/inputs/field';
import useAppContext from '@/hooks/providers/AppProvider';
import type { ResetFormType } from '@/interfaces/services';
import { AskResetPasswordSchemaValidator } from '@/libs/valideModules';
import cn from '@/utils/cn';
import { ErrorToast, InfoToast } from '@/utils/toaster';
import { Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

const ResetPasswordForm = () => {
  const {
    services: { askNewPassword },
  } = useAppContext();

  const initialValues: ResetFormType = {
    email: '',
  };

  const handleSubmit = useCallback(async (FormValues: ResetFormType) => {
    const { err, res: text } = await askNewPassword(FormValues);
    if (!err && !text) {
      return ErrorToast({ error: err });
    }

    InfoToast({ text });
  }, []);

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
          validationSchema={AskResetPasswordSchemaValidator}
        >
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
                autoComplete="off"
                onTouchClass="scale-85 mt-1"
                labelPlacement="outside"
                classNames={
                  {
                    label: '!text-p3 text-foreground/80 overflow-visible',
                    base: 'px-0.5 mb-5 lg:mb-6 xl:mb-8 h-fit shadow-border rounded-lg py-0.5 !bg-content hover:border-gradient',
                    input: 'hide-autofill h-full !text-p3 m-0 !border-none',
                    innerWrapper: 'p-0 !bg-content !border-none',
                    inputWrapper:
                      'h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content m-0 rounded-lg !border-none',
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
                Recevoir le code de réinitialisation
              </Button>
            </Form>
          )}
        </Formik>
      </motion.div>
    </>
  );
};

export default ResetPasswordForm;
