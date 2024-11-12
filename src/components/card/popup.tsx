'use client';
import cn from '@/utils/cn';
import { useCallback, useState } from 'react';
import { IoIosCloseCircleOutline } from 'react-icons/io';

const Popup = ({
  canClose = true,
  className,
  children,
  onClose,
}: {
  canClose?: boolean;
  className?: string;
  children: React.ReactNode;
  onClose?: () => unknown;
}) => {
  const [open, serOpen] = useState<boolean>(true);

  const handleClose = useCallback(() => {
    serOpen(false);
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  return (
    open && (
      <section className="fixed left-0 top-0 w-full flex justify-center items-center bg-black/40 z-50 h-full">
        <div
          className={cn(
            'bg-content text-foreground/70 flex flex-col items-center relative rounded-lg',
            className,
          )}
        >
          {canClose && (
            <IoIosCloseCircleOutline
              onClick={handleClose}
              className="absolute hover:text-errorTxt cursor-pointer top-0 right-0 translate-x-[35%] -translate-y-[35%] bg-content rounded-full w-8 h-8"
            />
          )}
          {children}
        </div>
      </section>
    )
  );
};

export default Popup;
