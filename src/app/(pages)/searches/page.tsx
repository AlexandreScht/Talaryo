import SearchFolders from '@/components/tables/searchFolders';
import { searchFoldersType } from '@/interfaces/searches';
import PrepareServices from '@/services';

const Searches = async () => {
  const { getSearchFolder } = PrepareServices();

  const { err, res } = await getSearchFolder({});

  const { results: folders, total = 0 } = res || {};

  return (
    <>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">Votre Collection</h1>
      <span className="text-foreground/60 text-h3">Retrouvez vos différentes recherches</span>
      {err && !folders ? (
        <div className="bg-content flex flex-col items-center mt-10 w-full px-16 xl:px-20 h-[75vh] justify-center rounded-lg">
          <h1 className="text-foreground/90 text-center text-h2 font-medium">Problème rencontré lors du chargement des dossiers de recherches</h1>
          <span className="text-foreground/70 text-p1 font-medium mt-1.5 lg:mt-3 xl:mt-5">
            Veuillez réessayer plus tard ou nous contacter si le problème persiste
          </span>
        </div>
      ) : (
        <section className="bg-content rounded-xl md:pb-0.5 lg:pb-2 xl:pb-3 md:px-6 lg:px-8 xl:px-10">
          <SearchFolders
            className="md:mt-9 lg:mt-12 xl:mt-14 mb-5 grid-cols-3 md:gap-x-5 lg:gap-x-12 xl:gap-x-24 md:gap-y-12 lg:gap-y-16 rounded-lg"
            foldersProps={folders as searchFoldersType[]}
            total={total}
          />
        </section>
      )}
    </>
  );
};

export default Searches;
