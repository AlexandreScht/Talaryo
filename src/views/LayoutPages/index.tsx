import SearchCard from '@/components/card/search';
import { pageType } from '@/interfaces/services';
import PrepareServices from '@/services';
import FavCard from '../favCard';

const LeftPagesSide = async ({ pageType }: { pageType?: pageType }) => {
  const { getSearches } = PrepareServices();

  const { err, res } = await getSearches({
    ...(pageType ? { isCv: pageType === 'cv' } : {}),
  });

  const { total = 0 } = res || {};

  return (
    <>
      <div className="w-full flex flex-col justify-center md:-translate-y-8 lg:translate-y-0">
        <article className="flex max-h-[50%] w-full bg-content border-1 border-asset/25 rounded-xl flex-col py-2 lg:py-3 px-[0.4rem] xl:py-4 xl:px-6">
          {err ? (
            <div className="h-full flex py-4 lg:py-0 lg:min-h-[6rem] xl:min-h-[7rem] flex-col justify-center">
              <span className="w-full text-center text-foreground/90 text-p1 font-medium">Une erreur est survenue</span>
              <span className="w-full text-center mt-2 text-foreground/90 text-p1 font-medium">Veuillez réessayer plus tard</span>
            </div>
          ) : total && total > 0 ? (
            <SearchCard
              pageType={pageType}
              totalFetched={total}
              className="flex flex-row w-full justify-between items-center pb-1 lg:pb-2 xl:pb-0 border-b-1 border-asset/60"
            >
              <h3 className="text-foreground/90 font-medium text-p2 lg:text-h4">Recherches enregistrées</h3>
            </SearchCard>
          ) : (
            <span className="w-full text-center py-5 text-foreground/90 text-p1 font-medium">Enregistrer des recherches pour les visualiser ici</span>
          )}
        </article>
        <FavCard
          pageType={pageType}
          className="md:mt-7 xl:mt-12 space-y-2 lg:space-y-2.5 xl:space-y-3 lg:min-h-[8rem] xl:min-h-[10rem]"
          titleClass="text-p2 lg:text-h4"
        />
      </div>
    </>
  );
};

export default LeftPagesSide;
