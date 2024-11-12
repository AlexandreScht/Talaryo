'use client';

import Button from '@/components/buttons';
import { Cancellation_choice } from '@/config/data';
import { ClientException } from '@/exceptions';
// import useAnalyticsContext from '@/hooks/providers/AnalyticsProvider';
import useAppContext from '@/hooks/providers/AppProvider';
import { cancelFeedback, cancelStripeOptions } from '@/interfaces/payement';
import cn from '@/utils/cn';
import serialize_recurring from '@/utils/serialize_recurring';
import { ErrorToast } from '@/utils/toaster';
import React, { useCallback, useRef, useState } from 'react';
import type Stripe from 'stripe';

const CancelSubBtn = ({
  className,
  disabled,
  children,
  subId,
  recurring,
  ended_at,
  price,
  plan,
}: {
  className: string;
  disabled: boolean;
  children: React.ReactNode;
  subId?: string;
  ended_at?: string;
  recurring: Stripe.Price.Recurring;
  price?: number;
  plan?: string;
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const [feedbackChoose, setFeedbackChoose] = useState<
    cancelFeedback | undefined
  >();
  const textValue = useRef<HTMLTextAreaElement>(null);
  const otherChoice = useRef<HTMLInputElement>(null);
  const isSingleChildDiv =
    React.Children.count(children) === 1 &&
    React.isValidElement(children) &&
    children.type === 'div';

  if (!isSingleChildDiv) {
    throw new ClientException(404, 'children need to be a unique div');
  }
  // const { trackGAEvent } = useAnalyticsContext();
  const {
    services: { cancellationSub },
  } = useAppContext();

  const handleCancelSub = useCallback(async () => {
    setLoading(true);

    const options: cancelStripeOptions | undefined = feedbackChoose
      ? { feedback: feedbackChoose }
      : undefined;

    if (options && feedbackChoose === 'other' && textValue?.current) {
      options.comment = textValue.current.value;
      textValue.current.value = '';
    }

    try {
      // trackGAEvent('Subscription', `Cancel_sub`, `Profile Page`, 1);
      await cancellationSub({ subId: subId as string, option: options });
    } catch (error) {
      ErrorToast({
        text: "Erreur lors de la résiliation de l'abonnement. Veuillez contacter le support ou réessayer plus tard",
      });
      console.error("Erreur lors de la résiliation de l'abonnement :", error);
    } finally {
      setLoading(false);
    }
  }, [cancellationSub, feedbackChoose, subId]);

  const handleChange = useCallback((v: cancelFeedback | undefined) => {
    setFeedbackChoose(v);
  }, []);

  const handleCancel = useCallback(() => {
    setActive(false);
  }, []);

  const handleOtherChoice = useCallback(() => {
    setFeedbackChoose('other');
    if (otherChoice.current) {
      otherChoice.current.checked = true;
    }
  }, []);

  const customedChild = React.cloneElement(children, {
    ...children.props,
    ref: targetRef,
    className: cn(
      `${children.props.className || ''} transition-all overflow-hidden duration-300`,
      {
        'max-h-full h-full opacity-100': active,
      },
    ),
    children: (
      <div className="relative md:w-11/12 lg:w-5/6 xl:w-4/5 md:px-5 md:pt-10 lg:pt-10 xl:pt-14 lg:px-7 xl:px-10 pb-0 bg-content border-1 border-asset/50 rounded-lg">
        <div className="w-full h-full flex flex-col justify-between">
          <div className="w-full flex-1 grid grid-cols-2 grid-rows-1 gap-x-16 lg:gap-x-20 xl:gap-x-28">
            <div className="w-full h-full flex flex-col">
              <div className="flex flex-row items-center">
                <span className="text-p1 text-foreground/80">Abonnement</span>
                <div className="px-1.5 lg:px-2 h-fit min-h-0 py-0 lg:py-0.5 bg-primary/10 mb-0.5 rounded-lg border-1 border-secondary ml-2">
                  <span className="text-p1 uppercase text-foreground/90">
                    {plan?.toLocaleUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-end">
                <span className="text-h1 text-special font-bold">{price}€</span>
                <span className="ml-2 pb-1 text-foreground/80 text-p2">
                  / {serialize_recurring(recurring, true)}
                </span>
              </div>
              <p className="my-10 text-foreground/80 text-p2">
                Une fois votre abonnement résilié,{' '}
                <b className="font-medium text-foreground/90">
                  il ne sera pas récupérable
                </b>{' '}
                et vous devrez en{' '}
                <b className="font-medium text-foreground/90">
                  souscrire un nouveau.
                </b>
              </p>
              <p className="text-foreground/80 text-p2">
                En résiliant maintenant, vous pourrez continuer à bénéficier de
                votre abonnement jusqu&#39;au{' '}
                <b className="font-medium text-foreground/90">{ended_at}</b>
              </p>
              <div className="flex flex-row mt-auto md:space-x-6 lg:space-x-8">
                <Button
                  onClick={handleCancel}
                  className="hover:cursor-pointer h-fit min-w-0 w-fit md:px-3 xl:px-4.5 text-p3 md:py-2 xl:py-2.5 hover:text-foreground/70 rounded-lg bg-transparent border-1 border-asset/60"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCancelSub}
                  className="text-white/95 h-fit min-w-0 w-fit md:px-3 xl:px-3.5 text-p3 md:py-2 xl:py-2.5 z-0 font-semibold bg-gradient-to-bl from-primary to-secondary/90 rounded-lg border-1 border-primary"
                >
                  Résilier votre abonnement
                </Button>
              </div>
            </div>
            <div className="w-full h-full flex flex-col">
              <div className="text-center w-full border-b-1 border-foreground/60 pb-3 lg:pb-4">
                <span className="text-p3 w-full font-medium">
                  Veuillez s&#39;il vous plaît indiquer la raison de votre
                  résiliation.
                </span>
              </div>
              <ul className="space-y-4 lg:space-y-5 mt-5 xl:mt-7 h-fit text-foreground/90 ">
                <>
                  {Cancellation_choice.map(
                    (choice, i) =>
                      choice.value !== 'other' && (
                        <li key={i} className="flex items-center text-p3 h-fit">
                          <input
                            className="w-2.5 h-2.5 xl:w-3.5 xl:h-3.5 mr-4 bg-asset border-1 border-secondary/80 rounded-full hover:cursor-pointer appearance-none checked:bg-special"
                            type="radio"
                            name="cancel_choice"
                            id={`choice_${choice.value}`}
                            checked={feedbackChoose === choice.value}
                            onChange={() => handleChange(choice.value)}
                          />
                          <label
                            htmlFor={`choice_${choice.value}`}
                            className={cn(
                              'transition-all hover:cursor-pointer',
                              {
                                'text-special font-medium scale-105 translate-x-[2.5%]':
                                  feedbackChoose === choice.value,
                              },
                            )}
                          >
                            {choice.label}
                          </label>
                        </li>
                      ),
                  )}
                  <input
                    ref={otherChoice}
                    type="radio"
                    className="hidden"
                    name="cancel_choice"
                  />
                </>
              </ul>
              <textarea
                ref={textValue}
                onClick={handleOtherChoice}
                className="w-full placeholder:text-foreground/60 custom-scrollbar mt-4 lg:mt-5 xl:mt-6 flex-1 text-foreground/90 text-p3 outline-none resize-none rounded-md border-1 border-foreground/20 bg-primary/10 p-2"
                placeholder="Autre(s) raison(s)"
              ></textarea>
            </div>
          </div>
          <p className="w-full text-center text-p4 py-2 mt-3 lg:mt-4 xl:mt-5 h-fit md:pb-4 text-foreground/80">
            Pour toutes autres questions, veuillez consulter nos conditions et
            politique de remboursement d&#39;abonnement, ou nous contacter.
          </p>
        </div>
      </div>
    ),
  });

  const handleClick = useCallback(async () => {
    setActive(true);
  }, []);

  return (
    <>
      <Button
        isLoading={loading}
        onClick={handleClick}
        className={className}
        disabled={disabled}
      >
        Annuler l&#39;abonnement
      </Button>
      {customedChild}
    </>
  );
};

export default CancelSubBtn;
