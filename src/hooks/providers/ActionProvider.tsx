'use client';

import cn from '@/utils/cn';
import { InfoToast } from '@/utils/toaster';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export const InProgressAction = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text?: string;
}) => {
  const handleClick = useCallback((v?: string) => {
    InfoToast({ text: v });
  }, []);

  const ChildActionCustom = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClick: () => handleClick(text) } as {
        onClick: () => void;
      });
    }
  });

  return <>{ChildActionCustom}</>;
};

export const OnOutsideClick = ({
  children,
  onClickOutside,
  className,
}: {
  className?: string;
  children: React.ReactNode;
  onClickOutside: () => unknown;
}) => {
  const outsideEl = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<boolean>(false);

  const handleOutsideClick = useCallback(() => {
    if (!focus) {
      return;
    }
    onClickOutside();
    setFocus(false);
  }, [focus, onClickOutside]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!outsideEl.current) {
        return;
      }
      const target = event.target as Node | null;
      if (outsideEl.current && outsideEl.current.contains(target)) {
        return setFocus(true);
      }
      if (outsideEl.current && !outsideEl.current.contains(target)) {
        return handleOutsideClick();
      }
    },
    [handleOutsideClick],
  );

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div ref={outsideEl} className={cn('w-full', className)}>
      {children}
    </div>
  );
};
