import PeriodSelector from '@/components/buttons/period';
import Subscribe from '@/components/card/subscribe';
import type { billPeriod, plan } from '@/interfaces/payement';
import PrepareServices from '@/services';

const BillingPage = async ({
  searchParams: { period = 'annual' },
}: {
  searchParams: { period: billPeriod };
}) => {
  const { getSubscribe } = PrepareServices();

  const { err, res: fetchSub } = await getSubscribe();

  return (
    <>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Abonnement
      </h1>
      <span className="text-foreground/60 text-h3">Souscrivez à un plan</span>
      <section className="w-full md:-mt-4 xl:mt-0 h-[84%] lg:mt-2 flex flex-col items-center">
        <PeriodSelector
          defaultPeriod="annual"
          periodsDesired={['annual', 'trimestrial', 'monthly']}
        />
        {!!err ? (
          <div className="w-full mt-10 xl:mt-16 h-full flex flex-row justify-center">
            <span className="w-full text-center py-5 text-foreground/90 text-p1 font-medium">
              Une erreur est survenue, veuillez réessayer plus tard
            </span>
          </div>
        ) : (
          <div className="w-full mt-10 xl:mt-16 h-full grid grid-cols-3 md:gap-x-7 lg:gap-x-12 xl:gap-x-16">
            {(['Free', 'Pro', 'Business'] as plan[]).map((plan, i) => (
              <Subscribe
                key={i}
                plan={plan}
                fetchSub={fetchSub}
                period={period}
                select="Pro"
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default BillingPage;
