'use client';

import { foldersChoose, formValues } from '@/interfaces/services';
import { SearchSchemaValidator } from '@/libs/valideModules';
import { Form, Formik } from 'formik';
import { useCallback, useMemo } from 'react';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import Button from '../buttons';
import InputField from '../inputs/field';

const AddSearchForm = ({
  setFolderProps,
}: {
  setFolderProps: React.Dispatch<
    React.SetStateAction<foldersChoose | undefined>
  >;
}) => {
  const handleBackButton = useCallback(
    (resetForm: () => void) => {
      resetForm();
      setFolderProps(undefined);
    },
    [setFolderProps],
  );

  const initValueSearch = useMemo(() => {
    return { name: '', society: '' };
  }, []);

  const handleSubmitForm = useCallback(
    (formValues: formValues) => {
      setFolderProps((prev) => {
        if (!prev) {
          return undefined;
        }
        return { ...prev, formValues };
      });
    },
    [setFolderProps],
  );

  return (
    <Formik
      initialValues={initValueSearch}
      onSubmit={handleSubmitForm}
      validationSchema={SearchSchemaValidator}
    >
      {({ isValid, dirty, isSubmitting, resetForm }) => (
        <Form className="flex flex-col w-full mt-5">
          <InputField
            type="text"
            label="Nom de la recherche"
            name="name"
            fullWidth
            isClearable
            variant="underlined"
            required
            autoComplete="off"
            classNames={{
              label: '!text-p2 text-foreground/60',
              base: 'w-full',
              input: 'hide-autofill text-p2',
              inputWrapper:
                'py-0 h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content',
            }}
          />

          <InputField
            type="text"
            name="society"
            label="Nom de société"
            fullWidth
            isClearable
            variant="underlined"
            autoComplete="off"
            classNames={{
              label: '!text-p2 text-foreground/60',
              base: 'my-2 lg:my-2.5 xl:my-3 w-full',
              input: 'hide-autofill text-p2',
              inputWrapper:
                'py-0 h-8 lg:h-[2.35rem] xl:h-10 min-h-0 !bg-content',
            }}
          />

          <div className="flex flex-row justify-between w-full md:mt-4 pb-1 lg:mt-5 px-5">
            <Button
              className="w-20 lg:w-24 xl:w-28 relative !text-p3 group xl:px-4 min-h-0 h-fit md:py-2 lg:py-2.5 xl:py-3 z-20 hover:z-0 rounded-md bg-primary/75 border-1 border-asset/50 text-white"
              onClick={() => handleBackButton(resetForm)}
            >
              <MdOutlineKeyboardBackspace className="transition-opacity w-full h-full scale-85 lg:scale-100 opacity-0 group-hover:opacity-100 absolute" />
              <span className="transition-opacity group-hover:opacity-0">
                Annuler
              </span>
            </Button>
            <Button
              className="w-20 lg:w-24 xl:w-28 xl:px-4 md:py-2 lg:py-2.5 min-h-0 h-fit xl:py-3 !text-p3 rounded-md bg-primary/75 border-1 border-asset/50 text-white"
              type="submit"
              disabled={!(dirty && isValid)}
              isLoading={isSubmitting}
            >
              Enregistrer
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddSearchForm;
