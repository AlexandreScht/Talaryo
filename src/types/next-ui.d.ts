declare module 'next-ui' {
  import { abonnement } from '@/interfaces/users';
  import type { AutocompleteItemProps, AutocompleteProps } from '@nextui-org/autocomplete';
  import type { ButtonProps } from '@nextui-org/button';
  import type { InputProps } from '@nextui-org/input';
  import { SliderProps } from '@nextui-org/react';
  import type { SwitchProps } from '@nextui-org/switch';
  // TODO : Communs types

  type inputType =
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';

  export type InputReactProps = React.InputHTMLAttributes<HTMLInputElement>;
  export type TextAreaReactProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  type ButtonReactProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

  type itemsContent = [ReactNode, ReactNode?];

  type customClass = [string, string?];

  // { length: 1 | 2 }
  // * input fields types
  type inputFieldCustomClassNames = {
    endContents?: customClass;
    startContents?: customClass;
  };

  type NewInputType<Props> = {
    [K in keyof Props]: K extends 'startContent' | 'endContent' ? undefined : Props[K];
  };

  type inputCustomProps = {
    name: string;
    onTouchClass?: string;
    type: inputType | 'textarea';
    showError?: boolean;
    error?: boolean;
    startContents?: itemsContent;
    endContents?: itemsContent;
    classNames?: inputFieldCustomClassNames;
    label?: string;
  };

  type inputPropsUI = inputCustomProps & InputProps;

  // * slider fields types

  type SliderClassNames = SliderProps['classNames'];

  interface CustomSliderClassNames {
    default: SliderClassNames;
    dragged?: SliderClassNames;
    hover?: SliderClassNames;
    pressed?: SliderClassNames;
    focus?: SliderClassNames;
  }
  type sliderCustomProps = {
    max: number;
    min: number;
    className?: string;
    defaultValue: number | [number, number];
    children?: React.ReactNode;
    classNames?: CustomSliderClassNames;
  };

  type sliderPropsUI = sliderCustomProps & Omit<SliderProps, 'defaultValue' | 'maxValue' | 'minValue' | 'classNames'>;

  // * Selector types

  type NewAutocompleteType<Props> = {
    [K in keyof Props]: K extends 'children' ? Props[K] | undefined : Props[K];
  };

  type autocompleteCustomProps = {
    className?: string;
    children?: React.ReactNode<AutocompleteItemProps> | React.ReactNode<AutocompleteItemProps>[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chooseValues?: (value: any) => void;
  };

  type autocompletePropsUI = autocompleteCustomProps & AutocompleteProps;

  // * button types
  type buttonPropsUI = ButtonReactProps & ButtonProps & { defaultLoading?: boolean };

  // * button toggleSwitch types

  type toggleButtonsClassNames = {
    base?: string;
    label?: string;
    startContent?: string;
    endContent?: string;
    wrapper?: string;
    thumb?: string;
    thumbIcon?: customClass;
  };

  type NewButtonsType<Props> = Props & {
    [K in keyof Props]: K extends 'thumbIcon' ? never : Props[K];
  };

  type toggleCustomProps = {
    thumbIcons?: itemsContent;
    required?: boolean;
    classNames?: toggleButtonsClassNames;
  };

  type toggleButtonsPropsUI = toggleCustomProps & ButtonReactProps & SwitchProps;

  // * Dropdown types
  type dropDownProps = {
    children: React.ReactNode;
    itemsDown: Record<'items' | 'redirection', string>[];
  };

  // * AutoComplete type
  interface CustomAutocompleteProps extends Omit<AutocompleteProps> {
    list?: abonnement[];
    className?: string;
    name: string;
  }
}
