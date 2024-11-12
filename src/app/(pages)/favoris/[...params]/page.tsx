import { initializedStorage } from '@/interfaces/scrapping';
import routes from '@/routes';
import PrepareServices from '@/services';
import CandidatTable from '@/views/table/candidat';
import { redirect } from 'next/navigation';

const Favoris = async ({
  params: {
    params: [folderName, page],
  },
}: {
  params: { params: [string, string] };
}) => {
  if (isNaN(Number.parseInt(page, 10)) || Number.parseInt(page, 10) <= 0) {
    redirect(routes.pages.favoris([folderName, 1]));
  }
  const { getFavoris } = PrepareServices();

  const { err, res } = await getFavoris({
    favFolderName: folderName,
    page: Number.parseInt(page, 10),
  });

  if ((err || err === undefined) && !res) {
    return (
      <>
        <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
          Vos Profils Favoris
        </h1>
        <span className="text-foreground/60 text-h3">
          Retrouvez tous les favoris de votre dossier
        </span>
        <div className="bg-content flex flex-col items-center mt-10 w-full px-16 xl:px-20 h-[75vh] justify-center rounded-lg">
          <h1 className="text-foreground/90 text-h2 font-medium">
            Problème rencontrée lors du chargement des profils favoris
          </h1>
          <span className="text-foreground/70 text-p1 font-medium mt-5">
            Veuillez réessayer plus tard ou nous contacter si le problème
            persiste
          </span>
        </div>
      </>
    );
  }

  const { results = [], total = 0 } = res || {};

  const favCandidats: initializedStorage = {
    pages: results,
    data: {
      start: 0,
      index: 0,
      search: {},
      total,
      nPages: Math.ceil((total || 0) / 10),
    },
  };

  return (
    <>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Vos Profils Favoris
      </h1>
      <span className="text-foreground/60 text-h3">
        Retrouvez tous les favoris de votre dossier
      </span>
      <CandidatTable page={page} favPage={favCandidats} />
    </>
  );
};

export default Favoris;
