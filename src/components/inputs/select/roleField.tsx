'use client';
import { roles } from '@/config/data';
import { abonnement } from '@/interfaces/users';
import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useField, useFormikContext } from 'formik';
import { CustomAutocompleteProps } from 'next-ui';
import { Key, useCallback } from 'react';

const RoleChoice = ({
  list = roles,
  className,
  name,
  ...other
}: CustomAutocompleteProps) => {
  const [field, meta, helpers] = useField(name);
  const { setFieldTouched } = useFormikContext();
  const handleChange = useCallback(
    (v: Key) => {
      if (v === undefined) {
        field.onChange({ target: { name: field.name, value: '' } });
        setFieldTouched(field.name, false);
      }
      helpers.setValue(v);
    },
    [field, helpers, setFieldTouched],
  );

  return (
    <Autocomplete
      variant="underlined"
      classNames={{
        listboxWrapper: 'bg-content text-lg',
        base: 'bg-content custom-label-font',
        popoverContent: 'p-0 rounded-lg shadow-sm shadow-asset/20',
      }}
      {...field}
      defaultItems={list}
      label="Role"
      isClearable
      isInvalid={!!meta.error && meta.touched}
      onSelectionChange={handleChange}
      className={className}
      {...other}
    >
      {(item: abonnement) => (
        <AutocompleteItem
          classNames={{
            base: 'data-[hover=true]:bg-primary data-[hover=true]:text-white data-[hover=true]:translate-x-1',
          }}
          key={item.value}
        >
          {item.label}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};

export default RoleChoice;
