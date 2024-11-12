import * as PeriodPlan from '@/config/plan';
import { ClientException } from '@/exceptions';
import { billPeriod, fetchSub, plan, priceProps } from '@/interfaces/payement';
import { getPriceDiscount, getStripePrice } from '@/libs/stripePrice';
import cn from '@/utils/cn';
import { Tooltip } from '@nextui-org/tooltip';
import { BiCheck, BiInfoCircle } from 'react-icons/bi';
import StripePayment from '../buttons/stripePayment';

const Subscribe = async ({
  className,
  plan,
  period,
  fetchSub,
  select,
}: {
  className?: string;
  plan: plan;
  fetchSub: fetchSub;
  period: billPeriod;
  select?: plan;
}) => {
  const currentPlan = Object.values(PeriodPlan)
    .map((p) => p)
    .find((obj) => obj.name === plan);

  if (!currentPlan) {
    return;
  }

  const price_props: priceProps | undefined = await getStripePrice(
    currentPlan.prices[period],
  );

  if (!price_props) {
    throw new ClientException(
      500,
      'Une erreur est survenue. Veuillez contacter le service client ou réessayer ultérieurement.',
    );
  }

  const { priceId, price, recurring } = price_props;
  const current_plan: boolean = isMyPlan(priceId, fetchSub);

  const discount =
    period === 'monthly' || !price_props?.price
      ? null
      : await getPriceDiscount(
          currentPlan.prices['monthly'] as string,
          getMonthPrice(period, price, recurring),
        );
  return (
    <div
      className={cn(
        'w-full h-fit relative rounded-xl lg:rounded-2xl text-foreground/90 bg-card shadow-sm shadow-shadow hover:shadow-special/75 md:px-2 lg:px-3 xl:px-5 py-3',
        { 'shadow-plan': select && select === plan },
        className,
      )}
    >
      <div
        className={cn(
          'absolute top-0 right-0 translate-x-1/3 -translate-y-1/2 bg-background',
          {
            hidden: period === 'monthly' || !price_props?.price || !discount,
          },
        )}
      >
        <div className="w-full h-full !text-h4 bg-gradient-to-bl from-primary to-secondary/75 shadow-plan text-white/80 md:py-1.5 lg:py-2 md:px-3 lg:px-5 rounded-md font-semibold">
          <span>-{discount}%</span>
        </div>
      </div>
      <h2 className="m-0 text-h3 font-bold">{currentPlan.name}</h2>
      <p className="mt-0.5 text-foreground/70 text-p3 pr-5">
        {currentPlan.description}
      </p>

      <div className={cn('flex flex-row mt-2 xl:mt-3', { '-mb-1': price })}>
        <h1 className="m-0 !text-h1 h-fit text-special font-bold">
          {getMonthPrice(period, price, recurring)}€
        </h1>
        <span className="h-fit mt-auto pb-1 ml-0.5 text-p3 font-medium">
          /mois
        </span>
      </div>
      {period !== 'monthly' && price && (
        <span className="text-p4 text-foreground/70">
          pour un total de {price}€
        </span>
      )}

      <StripePayment
        planType={currentPlan.name}
        currentItem={current_plan}
        fetchSub={fetchSub}
        price_props={price_props}
      />

      <div className="flex xl:mt-5 flex-col md:space-y-2.5 lg:space-y-3.5 xl:space-y-4">
        {currentPlan.list.map((benefits, i) => (
          <div
            key={i}
            className="w-full flex flex-row items-center justify-between"
          >
            <div className="flex flex-row">
              <div className="w-5 h-5 xl:w-6 xl:h-6">
                <BiCheck className="text-foreground/80 w-full p-0 m-0 h-full" />
              </div>
              <span className="text-foreground/80 text-p3 m-0 p-0 h-fit ml-2">
                {benefits.title}
              </span>
            </div>
            {benefits.tooltip && (
              <Tooltip
                classNames={{ content: 'text-p4' }}
                content={benefits.tooltip}
              >
                <BiInfoCircle className="w-3.5 h-3.5 mb-1 lg:mb-0.5 xl:mb-0 lg:w-4 lg:h-4 min-w-0 min-h-0 xl:w-[1.15rem] xl:h-[1.15rem] hover:cursor-pointer" />
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscribe;

function getMonthPrice(
  currentPlan: billPeriod,
  price?: number,
  recurring?: number,
): number {
  if (!price || !recurring) {
    return 0;
  }
  if (currentPlan === 'annual') {
    return price / 12;
  }
  return price / recurring;
}

function isMyPlan(priceId?: string, fetchSub?: fetchSub): boolean {
  if (!fetchSub && !priceId) {
    return true;
  }
  if (fetchSub?.priceId === priceId) {
    return true;
  }
  return false;
}
