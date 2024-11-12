'use client';

import cn from '@/utils/cn';
import { Chip as NextChip } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { IoMdClose } from 'react-icons/io';

const Chip = ({
  handleRemoveItems,
  children,
  className,
}: {
  handleRemoveItems?: () => unknown;
  children?: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useTheme();
  return (
    <NextChip
      variant="flat"
      endContent={
        !!handleRemoveItems && (
          <div className="w-full h-full flex flex-col mx-1 justify-center">
            <IoMdClose
              onClick={handleRemoveItems}
              className="stroke-[25] cursor-pointer scale-125 !opacity-80 hover:!opacity-100"
            />
          </div>
        )
      }
      classNames={{
        base: 'p-0 m-0 w-fit !rounded-md  border-1 border-secondary',
        content: 'p-0 m-0 w-fit md:px-0.5',
      }}
      className={cn(
        'text-white/80 w-fit bg-primary rounded-md h-full px-1',
        { 'text-white': theme === 'light' },
        className,
      )}
    >
      {children}
    </NextChip>
  );
};

export default Chip;
