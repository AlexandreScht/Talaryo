import HomeCard from '@/components/card';
import SearchCard from '@/components/card/search';
import authOptions from '@/config/authOption';
import routes from '@/routes';
import PrepareServices from '@/services';
import FavCard from '@/views/favCard';
import GraphicView from '@/views/graphic';
import UpdateSession from '@/views/session/update';
import LimitPlan from '@/views/userStates/limitPlan';
import { getServerSession, Session } from 'next-auth';
import { AiFillStar } from 'react-icons/ai';
import { BsFillPersonFill } from 'react-icons/bs';
import { FiCompass } from 'react-icons/fi';
import { MdOutlineEmail } from 'react-icons/md';

const Dashboard = async () => {
  const { user: User } = (await getServerSession(authOptions)) as Session;

  const { GetTotalUserScore } = PrepareServices();

  const { err, res } = await GetTotalUserScore(['searches', 'favorisSave', 'mails', 'searchSave']);

  return (
    <>
      {User.firstName ? (
        <>
          <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">Bonjour {User.firstName}</h1>
          <span className="text-foreground/60 text-h3">Bienvenue sur votre dashboard Talaryo</span>
          <section className="w-full h-fit relative md:mb-3 lg:mb-1 mt-5 lg:mt-3 xl:mt-5 grid pr-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-10 xl:gap-x-12 gap-y-7 lg:gap-y-6 xl:gap-y-8">
            <HomeCard
              route={routes.pages.pro()}
              role={User.role}
              icon={<FiCompass className="w-[75%] h-[75%]" />}
              title="Réseaux Pro"
              desc="Votre talent sur les réseaux pro"
              txt="Avec plus de 20 réseaux divers à votre disposition !"
              pack="Free"
            />

            <HomeCard
              route={routes.pages.cv()}
              role={User.role}
              icon={<FiCompass className="w-[75%] h-[75%]" />}
              title="CVthèque"
              desc="Voyez plus qu'un profil, un CV"
              txt="Accédez à de nombreux CV sur les différentes CVTech !"
              pack="Pro"
            />

            <div className="w-full max-h-56 lg:max-h-[18.5rem] xl:max-h-96 flex flex-row lg:grid lg:grid-cols-1 lg:grid-rows-2 gap-x-4 lg:gap-x-0 lg:gap-y-3 xl:gap-y-4">
              <article className="flex h-full border-1 border-asset/20 w-3/5 lg:w-full lg:col-span-1 bg-content rounded-lg lg:rounded-xl flex-col py-2 lg:py-3 xl:py-4 px-2 lg:px-5 xl:px-6">
                {!!err ? (
                  <div className="h-full flex flex-col justify-center">
                    <span className="w-full text-center py-5 text-foreground/90 text-p1 font-medium">
                      Une erreur est survenue, veuillez réessayer plus tard
                    </span>
                  </div>
                ) : res?.searchSave?.score && Number.parseInt(String(res.searchSave.score), 10) > 0 ? (
                  <SearchCard
                    cannotSearch
                    cannotClose
                    totalFetched={Number.parseInt(String(res.searchSave.score), 10)}
                    className="flex flex-row w-full justify-between pb-1.5 lg:pl-0 lg:pb-3 items-center border-b-1 border-asset/60"
                  >
                    <h3 className="text-foreground/90 font-semibold text-h4">Recherches enregistrées</h3>
                  </SearchCard>
                ) : (
                  <div className="h-full flex flex-col justify-center">
                    <span className="w-full text-center py-5 text-foreground/90 text-p1 font-medium">
                      Enregistrer des recherches pour les visualiser ici
                    </span>
                  </div>
                )}
              </article>
              <div className="flex-1 lg:w-full h-full grid grid-cols-1 grid-rows-4 lg:grid-cols-2 lg:grid-rows-2 gap-y-1.5 lg:gap-y-4 lg:gap-x-3.5">
                <div className="w-full relative border-1 border-asset/20 h-full bg-content rounded-lg xl:p-2 flex flex-col justify-center items-center">
                  {User?.role ? (
                    <p className="text-h3 relative mt-2 lg:mt-0 font-semibold uppercase w-full text-center">
                      <span className="text-i2 absolute -top-0.5 lg:top-0 left-0 pb-0.5 normal-case -translate-y-full w-full text-foreground/60">
                        Plan Actuel :
                      </span>
                      {User?.role}
                    </p>
                  ) : (
                    <p className="text-i1 text-foreground/90 w-full text-center">Une erreur est survenue, veuillez réessayer plus tard</p>
                  )}
                </div>
                <LimitPlan
                  icon={BsFillPersonFill}
                  label="Recherches"
                  className="mt-1.5 xl:mb-1"
                  value={res?.searchSave?.score}
                  total={res?.searchSave?.total}
                />
                <LimitPlan icon={MdOutlineEmail} label="Emails" className="mt-1.5 xl:mb-1" value={res?.mails?.score} total={res?.mails?.total} />
                <LimitPlan
                  icon={AiFillStar}
                  label="Favoris"
                  className="mt-1.5 xl:mb-1"
                  value={res?.favorisSave?.score}
                  total={res?.favorisSave?.total}
                />
              </div>
            </div>

            <FavCard limit={4} className="mt-0.5 lg:mt-0 space-y-2.5 xl:space-y-3.5 h-full xl:h-[21.5rem]" />

            <div className="bg-content border-1 border-asset/20 rounded-xl w-full min-h-[14.5rem] lg:min-h-[16rem] col-span-2 flex flex-col justify-between items-center px-2 py-1">
              <GraphicView User={User} className="w-full h-1/6 mb-auto flex flex-row items-center px-6 lg:pb-1.5 xl:pb-2 space-x-24" />
            </div>
          </section>
        </>
      ) : (
        <>
          <h1 className="text-3xl xl:text-4xl text-foreground/95 font-semibold mb-2">Vos informations</h1>
          <span className="text-foreground/60 text-base xl:text-lg">Veuillez renseigner vos informations personnelles</span>
          <section className="w-full h-[80vh] flex flex-col justify-center pr-1">
            <UpdateSession
              replace
              className="w-1/2 mx-auto bg-content p-10 rounded-lg shadow-sm shadow-asset/20 border-1 border-asset/20"
              userSession={User}
              updateKeys={[{ key: 'firstName' }, { key: 'lastName' }, { key: 'society', required: false, label: 'Société' }]}
            />
          </section>
        </>
      )}
    </>
  );
};

export default Dashboard;
