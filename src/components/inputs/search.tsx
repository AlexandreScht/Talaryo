'use client';

import cn from '@/utils/cn';
import { Input } from '@nextui-org/input';
import { BiSearchAlt } from 'react-icons/bi';

const SearchBar = ({
  value,
  handleSearch,
  label,
  textSize = 'p4',
  className,
}: {
  value?: string;
  textSize?: 'p1' | 'p2' | 'p3' | 'p4';
  handleSearch: (value: string) => void;
  label?: string;
  className?: string;
}) => {
  return (
    <Input
      className={cn('w-full', className)}
      variant="underlined"
      placeholder={label ?? 'Votre recherche...'}
      isClearable
      value={value}
      onValueChange={handleSearch}
      classNames={{
        base: 'text-foreground/90',
        inputWrapper: '!border-asset/50 h-fit min-h-0',
        input: cn('py-0 xl:py-0.5', `text-${textSize}`),
      }}
      startContent={
        <BiSearchAlt
          className={cn(
            'text-foreground/60 md:w-[1.15rem] md:h-[1.15rem] lg:w-5 lg:h-5 xl:w-6 xl:h-6',
          )}
        />
      }
    />
  );
};

export default SearchBar;
