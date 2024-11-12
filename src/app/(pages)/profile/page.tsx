import CancelSubBtn from '@/components/buttons/CancelSubBtn';
import FacturesBtn from '@/components/buttons/factures';
import authOptions from '@/config/authOption';
import { fetchSub, priceData } from '@/interfaces/payement';
import { getStripePriceId } from '@/libs/stripePrice';
import routes from '@/routes';
import PrepareServices from '@/services';
import cn from '@/utils/cn';
import UpdateSession from '@/views/session/update';
import { getServerSession, Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Dashboard = async () => {
  const { GetTotalUserScore, getSubscribe } = PrepareServices();

  const { user: User } =
    ((await getServerSession(authOptions)) as Session) || {};

  if (!User) {
    redirect(routes.pages.login());
  }

  const { err: scoreError, res } = await GetTotalUserScore(['searches']);
  const restSearchInMonth = Math.max(
    (res?.searchSave?.total as number) - (res?.searchSave?.score as number) ||
      0,
    0,
  );
  const { err: subErr, res: fetchSub } = await getSubscribe();
  const { ended_at, subscribe_status, subId, priceId } =
    (fetchSub as fetchSub) || {};
  const price_data: priceData | undefined = await getStripePriceId(
    priceId as string,
  );
  const { price, plan, recurring } = price_data || {};
  return (
    <main>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Mon Profil
      </h1>
      <span className="text-foreground/60 text-h3">
        Bienvenue sur votre profil Talaryo
      </span>
      <section className="w-full relative mt-14 lg:mt-16 xl:mt-28 pr-1 flex flex-col items-center">
        <div className="md:w-11/12 lg:w-5/6 xl:w-4/5 bg-content border-1 border-asset/50 rounded-lg">
          <div className="w-full relative h-12 lg:h-16 border-b-1 border-b-asset/50 flex flex-row justify-between items-center px-5">
            <div className="absolute top-0 rounded-full left-1/2 -translate-x-1/2 -translate-y-[60%] aspect-square z-50 md:w-16 lg:w-24 xl:w-28 shadow-md shadow-shadow">
              <Image
                src="https://lh3.googleusercontent.com/pw/AP1GczMrbPszxKqTZW_JjfF1w_V9VkBqoo3zYDJLVAuiQL7VYEo5nDd71fYgwYHIVXfKZb4JKwUuJfXbM6KW_lQ-nag95x3pfGnJLbj86zUxx_T13NOUOVCoRN4hsF_8BsThF03AHLeJDXy_R03gZHkxi_or=w919-h919-s-no-gm?authuser=1"
                fill
                sizes="100%"
                alt="profil picture"
                className="rounded-full border-2 border-asset/50"
              />
            </div>
            <div className="flex flex-row items-center">
              <span className="text-foreground/90 text-p1 font-semibold mr-5">
                Plan {User.role}
              </span>
              <Link
                href={routes.pages.billing()}
                className="text-white/95 font-semibold bg-gradient-to-bl from-primary to-secondary p-2 text-p3 rounded-md border-1 border-primary"
              >
                Changer de Plan
              </Link>
            </div>
            {isNaN(restSearchInMonth) &&
              (scoreError ? (
                <span className="text-errorTxt/90 text-p2 font-semibold">
                  Une erreur est survenue
                </span>
              ) : (
                <span className="text-foreground/90 text-p2 font-semibold">
                  {Number.parseInt(String(restSearchInMonth) as any) > 1
                    ? `${restSearchInMonth} recherches restantes`
                    : `${restSearchInMonth} recherche restante`}
                </span>
              ))}
          </div>
          <UpdateSession
            userSession={User}
            className="mt-7 mb-0 md:px-10 lg:px-16 xl:px-20"
            updateKeys={[
              { key: 'firstName', required: false },
              { key: 'lastName', required: false },
              { key: 'society', required: false, label: 'Société' },
            ]}
          />
          <div className="flex flex-col md:px-10 lg:px-16 xl:px-20">
            <div className="flex flex-col md:my-5 lg:my-6">
              <span className="text-foreground/75 text-h3 uppercase">
                E-MAIL
              </span>
              <span className="text-foreground/80 text-h3 font-bold">
                {User.email ?? 'Aucun(e)'}
              </span>
            </div>
          </div>
          {User.role !== 'admin' && recurring && (
            <div className="flex w-full flex-col md:px-10 lg:px-16 xl:px-20">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                  {subErr ? (
                    <>
                      <span className="text-foreground/75 text-h3 uppercase">
                        Votre abonnement
                      </span>
                      <span className="text-errorTxt/80 text-p1 font-semibold">
                        Une erreur est survenue
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-foreground/75 text-h3 uppercase">
                        {subscribe_status === 'active'
                          ? 'Renouvellement'
                          : 'Fin'}{' '}
                        de l&apos;abonnement
                      </span>
                      <span className="text-foreground/80 text-h3 font-bold">
                        {ended_at ? ended_at : 'Aucun abonnement actif'}
                      </span>
                    </>
                  )}
                </div>
                <FacturesBtn
                  disabled={!ended_at}
                  className={cn(
                    'bg-successBg/90 px-2.5 py-2.5 min-h-0 h-fit lg:px-3 xl:px-3.5 border-1 border-asset/25 !text-p2 lg:py-3 xl:py-2.5 opacity-100 text-successTxt rounded-md',
                    {
                      'opacity-80': !ended_at,
                    },
                  )}
                >
                  <div className="absolute md:w-4/5 lg:w-3/5 mt-[20vh] left-1/2 -translate-x-1/2 top-full">
                    <h1 className="w-full text-h3 text-center m-0 mb-10 -mt-2 underline">
                      Vos factures
                    </h1>
                  </div>
                </FacturesBtn>
              </div>
              <div className="w-full flex flex-row justify-center my-4">
                <CancelSubBtn
                  disabled={!ended_at}
                  subId={subId}
                  price={price}
                  plan={plan}
                  recurring={recurring}
                  ended_at={ended_at}
                  className={cn(
                    'bg-errorBg px-2.5 py-2.5 min-h-0 h-fit lg:px-4 xl:px-5 !text-p2 lg:py-3 xl:py-2.5 opacity-100 text-errorTxt rounded-md',
                    {
                      'opacity-80': !ended_at,
                    },
                  )}
                >
                  <div className="absolute flex justify-center z-10 top-0 left-0 w-full max-h-0"></div>
                </CancelSubBtn>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
