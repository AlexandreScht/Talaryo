import FolderTable from '@/components/tables/favorisFolders';
import PrepareServices from '@/services';

const Favoris = async () => {
  const { getFavFolders } = PrepareServices();

  const { err, res } = await getFavFolders({ limit: 12 });

  return (
    <>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Votre Collection
      </h1>
      <span className="text-foreground/60 text-h3">
        Retrouvez vos différents favoris
      </span>
      {(err || err === undefined) && !res ? (
        <div className="bg-content flex flex-col items-center mt-10 w-full px-16 xl:px-20 h-[75vh] justify-center rounded-lg">
          <h1 className="text-foreground/90 text-h2 font-medium">
            Problème rencontrée lors du chargement des dossiers favoris
          </h1>
          <span className="text-foreground/70 text-p1 font-medium mt-1.5 lg:mt-3 xl:mt-5">
            Veuillez réessayer plus tard ou nous contacter si le problème
            persiste
          </span>
        </div>
      ) : (
        <section className="w-full relative bg-content md:mt-8 lg:mt-10 xl:mt-12 grid md:px-14 lg:px-16 xl:px-20 md:pb-5 lg:pb-8 xl:pb-14 md:pt-[5.5rem] lg:pt-[6.5rem] xl:pt-32 grid-cols-4 md:gap-x-20 lg:gap-x-24 md:gap-y-7 lg:gap-y-14 xl:gap-y-20 rounded-lg mb-5">
          <FolderTable foldersFetchList={res as any} />
        </section>
      )}
    </>
  );
};

export default Favoris;
