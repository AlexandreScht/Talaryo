'use client';

import cn from '@/utils/cn';
import { Input } from '@nextui-org/input';
import { Field, FieldProps } from 'formik';
import type { NewInputType, TextAreaReactProps, customClass, inputPropsUI, itemsContent } from 'next-ui';
import React, { useCallback, useState } from 'react';

const InputField = ({
  required,
  classNames,
  className,
  onTouchClass,
  name,
  type,
  isClearable,
  showError,
  startContents,
  endContents,
  disabled,
  label = name,
  ...other
}: NewInputType<inputPropsUI>) => {
  const customLabel = required ? label : `${label} (optional)`;
  const [toggleSwitch, setToggleSwitch] = useState<boolean>(true);
  const [value, setValue] = useState<string>('');
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const toggleHandleChange = () => setToggleSwitch(!toggleSwitch);
  const handleChange = useCallback((v: string) => {
    setValue(v);
  }, []);

  const handleSetFocus = useCallback((v: boolean) => {
    setIsFocus(v);
  }, []);

  return (
    <Field {...(type === 'textarea' ? { as: 'textarea' } : {})} name={name}>
      {({ field, meta, form }: FieldProps) => {
        const handleClear = () => {
          field.onChange({ target: { name: field.name, value: '' } });
          form.setFieldTouched(field.name, false);
        };

        const GetError = meta.error && meta.touched;
        const Error = showError && GetError ? meta.error : null;
        const fieldType = type === 'password' && !toggleSwitch ? 'text' : type;

        return (
          <div onFocus={() => handleSetFocus(true)} onBlur={() => handleSetFocus(false)}>
            {type === 'textarea' ? (
              <div>
                <textarea
                  required={required}
                  disabled={disabled}
                  className={cn(
                    {
                      'cursor-not-allowed': disabled,
                    },
                    className,
                  )}
                  {...field}
                  {...(other as TextAreaReactProps)}
                />
                {Error && <span>Erreur</span>}
              </div>
            ) : (
              <div
                className={cn(
                  {
                    'cursor-not-allowed': disabled,
                  },
                  className,
                )}
              >
                <Input
                  type={fieldType}
                  label={customLabel}
                  {...field}
                  isDisabled={disabled}
                  validationState={GetError ? 'invalid' : 'valid'}
                  classNames={{
                    ...classNames,
                    label: cn(
                      (classNames as any)?.label,
                      {
                        'text-errorTxt/90': GetError,
                      },
                      { [`${onTouchClass}`]: !!value || isFocus },
                    ),
                    innerWrapper: cn('pb-2', (classNames as any)?.innerWrapper),
                  }}
                  errorMessage={Error}
                  onValueChange={handleChange}
                  autocomplete={true}
                  endContent={ItemsContents(endContents, false, toggleHandleChange, toggleSwitch, classNames?.endContents)}
                  startContent={ItemsContents(startContents, false, toggleHandleChange, toggleSwitch, classNames?.startContents)}
                  {...(isClearable ? { onClear: handleClear } : {})}
                  {...other}
                />
              </div>
            )}
          </div>
        );
      }}
    </Field>
  );
};

export default InputField;

function ItemsContents(
  JSXarr: itemsContent | undefined,
  positionStart: boolean,
  toggleChange?: () => void,
  toggle?: boolean,
  className?: customClass,
): JSX.Element | null {
  if (!JSXarr?.length) {
    return null;
  }

  const [classNamePrimary, classNameSecondary] = className ? className : ['', ''];
  const [primaryJSX, secondaryJSX] = JSXarr;

  const commonProps = {
    className: cn(
      'h-auto text-default-500 hover:text-default-700 flex-shrink-1 w-9',
      { 'w-7': positionStart },
      toggle ? classNamePrimary : classNameSecondary,
    ),
  };

  if (JSXarr.length === 1) {
    return primaryJSX(commonProps);
  }

  return (
    <button className="focus:outline-none" type="button" onClick={toggleChange}>
      {toggle ? primaryJSX(commonProps) : secondaryJSX(commonProps)}
    </button>
  );
}
