'use client';
import { role } from '@/interfaces/users';
import cn from '@/utils/cn';
import { Autocomplete } from '@nextui-org/react';
import { autocompletePropsUI } from 'next-ui';
import { useCallback } from 'react';

const Select = ({
  className,
  chooseValues,
  children,
  ...props
}: autocompletePropsUI) => {
  const hadleChange = useCallback(
    (v: React.Key) => {
      if (chooseValues) {
        chooseValues(v as role);
      }
    },
    [chooseValues],
  );
  return (
    <div className={cn('w-full bg-content relative', className)}>
      <Autocomplete
        onSelectionChange={hadleChange}
        classNames={{
          base: 'h-full autocomplete-custom text-transparent',
          listboxWrapper: 'bg-asset/10',
        }}
        className="w-full h-full top-0 left-0 absolute"
        {...props}
      >
        {children}
      </Autocomplete>
    </div>
  );
};

export default Select;
