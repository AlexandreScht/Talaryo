'use client';

import Button from '@/components/buttons';
import InputField from '@/components/inputs/field';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import type { sessionKey, updateSession, userPayload } from '@/interfaces/users';
import { Schema, stringValidator } from '@/libs/validates';
import { createValidator } from '@/libs/valideModules';
import cn from '@/utils/cn';
import merge from 'deepmerge';
import { Form, Formik } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useRef, useState } from 'react';

type inputsData = {
  shape: boolean;
  key: string;
};

const UpdateSession = ({
  className,
  userSession,
  updateKeys,
  replace,
}: {
  className?: string;
  userSession: userPayload;
  updateKeys: updateSession[];
  replace?: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [editStates, setEditStates] = useState(updateKeys.map(() => false));
  const [inputsData, setInputsData] = useState<inputsData[]>(updateKeys.map(v => ({ shape: false, key: v.key })));
  const inputRefs = useRef<React.RefObject<HTMLInputElement>[]>(updateKeys.map(() => React.createRef()));

  const {
    services: { updateUsers },
  } = useAppContext();
  const router = useRouter();
  const { data: session, update } = useSession();

  const initialValues = useMemo(() => updateKeys.reduce((sessionKey, onj) => ({ ...sessionKey, [onj.key]: '' }), {}), [updateKeys]);

  const validationSchema: Schema = useMemo(
    () =>
      updateKeys.reduce((sessionKey, obj) => {
        const validator = stringValidator;
        return sessionKey.shape({
          [obj.key]: obj.required === false ? validator : validator.required(),
        });
      }, createValidator({})),
    [updateKeys],
  );

  const handleSubmit = useCallback(
    async (FormValues: Record<string, string | undefined>, needReload: boolean) => {
      const newSession: Record<string, string | undefined> = merge(userSession, FormValues);

      const { err, res: user } = await updateUsers({ user: FormValues as any });
      if (err || !user) {
        throw new ClientException(500, 'Impossible de mettre à jour les données, veuillez réessayer plus tard.');
      }
      await update({
        ...session,
        user: newSession,
      });
      if (needReload) {
        router.refresh();
      }
    },
    [router, session, update, updateUsers, userSession],
  );

  const validShape = useCallback((key: sessionKey): boolean => inputsData.some(el => el.key === key && el.shape === true), [inputsData]);

  const handleEdit = useCallback(
    async (key: sessionKey, index: number) => {
      if (validShape(key) && editStates[index]) {
        const input = inputRefs.current[index]?.current;
        setLoading(true);
        await handleSubmit({ [key]: input?.value }, false);
        (userSession as any)[key] = input?.value as string;
        setLoading(false);
        setInputsData(prev =>
          prev.map(data => {
            if (data.key === key) {
              return { ...data, shape: false };
            }
            return data;
          }),
        );
      }
      setEditStates(prev => prev.map((state, i) => (i === index ? !state : state)));
    },
    [editStates, handleSubmit, userSession, validShape],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, key: sessionKey) => {
      if (e.target.value === (userSession as any)[key] || !e.target.value) {
        return setInputsData(prev =>
          prev.map(data => {
            if (data.key === key) {
              return { ...data, shape: false };
            }
            return data;
          }),
        );
      }
      setInputsData(prev =>
        prev.map(data => {
          if (data.key === key) {
            return {
              ...data,
              shape: isValid(validationSchema, { [key]: e.target.value }, key),
            };
          }
          return data;
        }),
      );
    },
    [userSession, validationSchema],
  );

  const handleKeyPress = useCallback(
    (evt: React.KeyboardEvent<HTMLInputElement>, index: number, key: sessionKey) => {
      if (evt.key === 'Escape') {
        setEditStates(prev => prev.map((state, i) => (i === index ? !state : state)));
      }
      if (evt.key === 'Enter') {
        handleEdit(key, index);
      }
    },
    [handleEdit],
  );

  return (
    <div className={cn('w-full', className)}>
      {replace ? (
        <Formik initialValues={initialValues} onSubmit={e => handleSubmit(e, true)} validationSchema={validationSchema}>
          {({ isValid, dirty, isSubmitting }) => (
            <Form className="flex flex-col gap-y-3 lg:gap-y-3.5 xl:gap-y-4">
              {updateKeys.map((sessionField, i) => (
                <InputField
                  key={i}
                  type="text"
                  label={sessionField.label ? sessionField.label : serializeLabelName(sessionField.key)}
                  name={sessionField.key}
                  fullWidth
                  isClearable
                  variant="underlined"
                  radius="sm"
                  required={sessionField.required === false ? false : true}
                  classNames={{
                    label: '!text-p2 text-foreground/60',
                    base: 'w-full',
                    input: 'hide-autofill text-p2',
                    inputWrapper: 'py-0 h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content',
                  }}
                />
              ))}
              <Button
                className={cn(
                  '!text-p1 font-medium min-h-0 h-fit py-2 lg:py-2.5 text-white relative w-full mt-5 bg-primary rounded-lg border-1 border-border',
                  {
                    'bg-gradient-to-tr from-secondary to-special opacity-100 border-2 border-primary': dirty && isValid,
                  },
                )}
                type="submit"
                disabled={!(dirty && isValid)}
                isLoading={isSubmitting}
              >
                Envoyer
              </Button>
            </Form>
          )}
        </Formik>
      ) : (
        <div className="md:space-y-5 lg:space-y-6">
          {updateKeys.map((sessionField, i) => (
            <div key={i} className="flex flex-row justify-between items-center">
              <div className="flex flex-col">
                <span className="text-foreground/75 text-h3 uppercase">
                  {sessionField.label ? sessionField.label : serializeLabelName(sessionField.key)}
                </span>
                {editStates[i] ? (
                  <input
                    ref={inputRefs.current[i]}
                    onKeyDown={evt => handleKeyPress(evt, i, sessionField.key)}
                    onChange={e => handleChange(e, sessionField.key)}
                    className="text-foreground/90 text-h3 font-bold bg-content border-b-1 border-b-foreground/90 outline-none"
                    {...((userSession as any)[sessionField?.key]
                      ? { defaultValue: (userSession as any)[sessionField.key] }
                      : { placeholder: 'Aucun(e)' })}
                  />
                ) : (
                  <span className="text-foreground/90 text-h3 font-bold">{(userSession as any)[sessionField.key] ?? 'Aucun(e)'}</span>
                )}
              </div>
              <Button
                onClick={() => handleEdit(sessionField.key, i)}
                isLoading={loading}
                className={cn(
                  'bg-transparent border-1 md:px-3 min-h-0 h-fit py-2.5 lg:px-3.5 xl:mb-1 text-foreground/90 border-foreground/70 rounded-md !text-p2 font-medium lg:py-3 xl:py-2.5',
                  {
                    'text-special border-gradient w-fit': editStates[i] && validShape(sessionField.key),
                  },
                )}
              >
                {editStates[i] ? (validShape(sessionField.key) ? 'Enregistrer' : 'Annuler') : 'Modifier'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdateSession;

function serializeLabelName(name: sessionKey): string {
  if (name === 'firstName') {
    return 'Prénom';
  }
  if (name === 'lastName') {
    return 'Nom';
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function isValid(schema: Schema, value: { [key: string]: string }, key: sessionKey): boolean {
  try {
    schema.validateSyncAt(key, value);
    return true;
  } catch (error) {
    return false;
  }
}
