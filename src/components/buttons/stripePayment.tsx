'use client';

import { Cancellation_choice } from '@/config/data';
// import useAnalyticsContext from '@/hooks/providers/AnalyticsProvider';
import useAppContext from '@/hooks/providers/AppProvider';
import {
  billPeriod,
  cancelFeedback,
  cancelStripeOptions,
  fetchSub,
  plan,
  priceProps,
} from '@/interfaces/payement';
import cn from '@/utils/cn';
import { ErrorToast } from '@/utils/toaster';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import Button from './index';

const StripePayment = ({
  currentItem,
  fetchSub,
  price_props,
  planType,
}: {
  planType: plan;
  currentItem: boolean;
  fetchSub: fetchSub;
  price_props: priceProps;
}) => {
  const [askIt, setAskIt] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackChoose, setFeedbackChoose] = useState<
    cancelFeedback | undefined
  >();
  const textValue = useRef<HTMLTextAreaElement>(null);
  const {
    services: { cancellationSub, updateSubscribe, createSubscribe },
  } = useAppContext();
  const router = useRouter();
  // const { trackGAEvent } = useAnalyticsContext();
  const searchParams = useSearchParams();
  const { period } = useMemo(
    () => (Object.fromEntries(searchParams) as { period: billPeriod }) || {},
    [searchParams],
  );

  const handleChange = useCallback((v: cancelFeedback | undefined) => {
    setFeedbackChoose(v);
  }, []);

  const handleClickBack = useCallback(() => {
    setAskIt(false);
  }, []);
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
      // trackGAEvent('Subscription', `Cancel_sub`, `Billing Page`, 1);
      await cancellationSub({
        subId: fetchSub?.subId as string,
        option: options,
      });
    } catch (error) {
      ErrorToast({
        text: "Erreur lors de la résiliation de l'abonnement. Veuillez contacter le support ou réessayer plus tard",
      });
    } finally {
      setLoading(false);
    }
  }, [cancellationSub, feedbackChoose, fetchSub?.subId]);

  const handleUpdateSub = useCallback(async () => {
    if (!price_props || !fetchSub) {
      return;
    }
    const { priceId } = price_props;
    const { itemSub, subId } = fetchSub;

    const { err, res: uri } = await updateSubscribe({
      price_id: priceId as string,
      itemSub,
      subId,
    });
    if (err) {
      ErrorToast({ text: "Impossible de mettre à jour l'abonnement" });
      return;
    }
    router.replace(uri as string);

    // trackGAEvent(
    //   'Subscription',
    //   `Update_sub`,
    //   `${period} - ${planType}`,
    //   1,
    //   redirectUri,
    // );
  }, [fetchSub, period, planType, price_props, router, updateSubscribe]);

  const handleCreateSub = useCallback(async () => {
    try {
      if (!price_props) {
        return;
      }

      const { priceId } = price_props;

      const { err, res: uri } = await createSubscribe(priceId as string);
      console.log(err);

      if (err) {
        ErrorToast({ text: "Impossible de mettre à jour l'abonnement" });
        return;
      }
      router.replace(uri as string);

      // trackGAEvent(
      //   'Subscription',
      //   `Create_sub`,
      //   `${period} - ${planType}`,
      //   1,
      //   redirectUri,
      // );
    } catch (error) {
      console.log(error);
    }
  }, [createSubscribe, period, planType, price_props, router]);

  if (!currentItem && !!fetchSub && !price_props.priceId) {
    //* cancel subscription
    return (
      <>
        <div
          className={cn(
            'absolute w-full h-0 max-h-0 bg bg-card top-0 left-0 overflow-hidden rounded-2xl px-3 xl:px-5 pt-4 -z-10 transition-all',
            {
              'h-full max-h-full z-10': askIt,
            },
          )}
        >
          <div className="text-center border-b-1 border-foreground/60 pb-2.5 lg:pb-3.5 xl:pb-4">
            <p className="text-p2 w-full font-medium">
              Veuillez s&#39;il vous plaît indiquer la raison de votre
              résiliation.
            </p>
          </div>
          <ul className="space-y-3.5 lg:space-y-4 xl:space-y-5 mt-4 lg:mt-5 xl:mt-7 mb-3 xl:mb-5 h-fit text-foreground/90 ">
            {feedbackChoose === 'other' ? (
              <>
                <li className="flex items-center text-p3 h-fit">
                  <input
                    className="h-3 w-3 xl:w-3.5 xl:h-3.5 mr-4 bg-asset border-1 border-secondary/80 rounded-full hover:cursor-pointer appearance-none checked:bg-special"
                    type="radio"
                    id="cancel_choice"
                    name="cancel_choice"
                    onChange={() => handleChange(undefined)}
                  />
                  <label
                    htmlFor="cancel_choice"
                    className="hover:cursor-pointer"
                  >
                    Revenir à la sélection des choix
                  </label>
                </li>
                <li className="flex items-center text-p3 h-fit">
                  <input
                    className="h-3 w-3 xl:w-3.5 xl:h-3.5 mr-4 bg-asset border-1 border-secondary/80 rounded-full hover:cursor-pointer appearance-none checked:bg-special"
                    type="radio"
                    name="cancel_choice"
                    checked={true}
                  />
                  <span className="text-special font-medium scale-105 translate-x-[2.5%]">
                    Autre
                  </span>
                </li>
                <textarea
                  ref={textValue}
                  className="w-full placeholder:text-foreground/60 custom-scrollbar text-p3 text-foreground/90 outline-none resize-none h-28 xl:h-32 rounded-md border-1 border-foreground/20 bg-primary/10 p-2"
                  placeholder="Veuillez préciser votre raison ici"
                ></textarea>
              </>
            ) : (
              Cancellation_choice.map((choice, i) => (
                <li key={i} className="flex items-center text-p3 h-fit">
                  <input
                    className="h-2.5 w-2.5 xl:w-3.5 xl:h-3.5 mr-4 bg-asset border-1 border-secondary/80 rounded-full hover:cursor-pointer appearance-none checked:bg-special"
                    type="radio"
                    name="cancel_choice"
                    id={`choice_${choice.value}`}
                    checked={feedbackChoose === choice.value}
                    onChange={() => handleChange(choice.value)}
                  />
                  <label
                    htmlFor={`choice_${choice.value}`}
                    className={cn('transition-all hover:cursor-pointer', {
                      'text-special font-medium scale-105 translate-x-[2.5%]':
                        feedbackChoose === choice.value,
                    })}
                  >
                    {choice.label}
                  </label>
                </li>
              ))
            )}
          </ul>
          <div className="w-full flex flex-row justify-between">
            <button
              className="hover:cursor-pointer text-p3 hover:text-foreground/70"
              onClick={handleClickBack}
            >
              Annuler
            </button>
            <Button
              onClick={handleCancelSub}
              isLoading={loading}
              className="text-white/95 z-0 text-p3 md:py-2 min-h-0 h-fit lg:py-2.5 w-full font-semibold bg-gradient-to-bl from-primary to-secondary/90 rounded-lg border-1 border-primary"
            >
              Résilier l&#39;abonnement
            </Button>
          </div>
        </div>
        <div className="w-full md:px-1.5 md:my-1.5 lg:my-2.5">
          <Button
            onClick={() => setAskIt(() => true)}
            className={cn(
              'text-white/95 z-0 text-p3 md:py-2 min-h-0 h-fit lg:py-2.5 w-full font-semibold bg-gradient-to-bl from-primary to-secondary/90 rounded-lg border-1 border-primary',
            )}
          >
            Résilier l&#39;abonnement
          </Button>
        </div>
      </>
    );
  }
  if (!currentItem && !!fetchSub) {
    //* update subscription
    return (
      <div className="w-full md:px-1.5 md:my-1.5 lg:my-2.5">
        <Button
          onClick={handleUpdateSub}
          className="text-white/95 font-semibold text-p3 md:py-2 min-h-0 h-fit lg:py-2.5 w-full mx-auto bg-gradient-to-bl from-primary to-secondary/90 rounded-lg border-1 border-primary"
        >
          Changer d&#39;abonnement
        </Button>
      </div>
    );
  }
  if (currentItem) {
    //* current subscription
    return (
      <div className="w-full md:px-1.5 md:my-1.5 lg:my-2.5">
        <Button
          disabled
          className="text-foreground/90 bg-transparent font-semibold text-p3 md:py-2 min-h-0 h-fit lg:py-2.5 w-full rounded-lg border-1 border-gradient opacity-100"
        >
          Plan actuelle
        </Button>
      </div>
    );
  }

  return (
    //* get subscription
    <div className="w-full md:px-1.5 md:my-1.5 lg:my-2.5">
      <Button
        onClick={handleCreateSub}
        className="text-white/95 font-semibold text-p3 md:py-2 min-h-0 h-fit lg:py-2.5 w-full bg-gradient-to-bl from-primary to-secondary/90 rounded-lg border-1 border-primary"
      >
        Souscrivez maintenant
      </Button>
    </div>
  );
};

export default StripePayment;
