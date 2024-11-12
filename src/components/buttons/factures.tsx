'use client';

import Button from '@/components/buttons';
import { ClientException } from '@/exceptions';
import useAppContext from '@/hooks/providers/AppProvider';
import { Invoices } from '@/interfaces/payement';
import cn from '@/utils/cn';
import { useIntersection } from '@mantine/hooks';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const ProfilBtn = ({
  className,
  disabled,
  children,
}: {
  className: string;
  disabled: boolean;
  children: React.ReactNode;
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<Invoices[] | undefined>(undefined);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const targetRef = useRef<HTMLDivElement>(null);

  const isSingleChildDiv =
    React.Children.count(children) === 1 &&
    React.isValidElement(children) &&
    children.type === 'div';

  if (!isSingleChildDiv) {
    throw new ClientException(404, 'children need to be a unique div');
  }
  const { ref, entry } = useIntersection();

  const {
    services: { getInvoices },
  } = useAppContext();

  const handleDownload = useCallback((url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'facture-talaryo.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const customedChild = React.cloneElement(children, {
    ...children.props,
    ref: targetRef,
    className: cn(`${children.props.className || ''} overflow-hidden`, {
      'h-0 border-0 mb-0': !active,
    }),
    children: (
      <div
        ref={ref}
        className="relative w-full h-full py-6 lg:py-8 bg-content border-1 border-asset/50 rounded-lg mb-3.5 lg:mb-5"
      >
        {children.props.children}
        <div className="w-full space-y-7 lg:space-y-10 px-16">
          {invoices?.map((v, i) => (
            <div
              key={i}
              className={cn('w-full flex flex-row justify-between', {
                'border-b-1 border-b-asset pb-3.5 lg:pb-5':
                  i < invoices.length - 1,
              })}
            >
              <div className="flex flex-col">
                <p>
                  <span className="text-p2 text-foreground/75">
                    {v.billing}
                  </span>{' '}
                  -{' '}
                  <span className="text-p1 uppercase font-medium">
                    {v.plan}
                  </span>
                </p>
                <div className="flex flex-row items-end">
                  <h2 className="!text-h1 h-fit text-special font-semibold m-0 pt-0.5 lg:pt-1">
                    {v.price}€
                  </h2>
                  <span className="ml-2 h-fit pb-1 text-p3 text-foreground/90">
                    / {v.recurring}
                  </span>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <span className="mt-1 xl:-mt-2 mb-1.5 lg:mb-2 xl:mb-1.5 text-p3 text-foreground/90">
                  {v.start}
                </span>
                <div className="flex flex-row">
                  <Link
                    href={v.url}
                    target="_blank"
                    className="rounded-md h-fit !text-p3 min-h-0 md:py-[0.425rem] lg:py-2 flex items-center md:px-3 lg:px-4 bg-transparent border-1 transition-transform text-successTxt border-secondary mr-5 hover:scale-105"
                  >
                    Voir
                  </Link>
                  <Button
                    onClick={() => handleDownload(v.pdf)}
                    className="rounded-md h-fit !text-p3 md:py-[0.425rem] lg:py-2 bg-successBg/90 md:px-3 lg:px-3.5 text-foreground border-secondary border-1 hover:scale-105"
                  >
                    Telecharger
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  });

  useEffect(() => {
    const currentRef = targetRef?.current;
    if (!active || !currentRef) {
      return;
    }
    currentRef.scrollIntoView({ behavior: 'smooth' });

    if (!entry?.isIntersecting && active && hasBeenVisible) {
      setActive(false);
    }
    setHasBeenVisible(!!entry?.isIntersecting);
  }, [active, entry?.isIntersecting, hasBeenVisible]);

  const handleClick = useCallback(async () => {
    if (invoices) {
      return setActive(true);
    }
    setLoading(true);
    const { err, res } = await getInvoices();
    setLoading(false);
    if (err) {
      return;
    }
    setActive(true);

    setInvoices(res as any);
  }, [getInvoices, invoices]);

  return (
    <>
      <Button
        isLoading={loading}
        onClick={handleClick}
        className={className}
        disabled={disabled}
      >
        Mes factures
      </Button>
      {customedChild}
    </>
  );
};

export default ProfilBtn;
