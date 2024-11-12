import { pageType } from '@/interfaces/services';
import routes from '@/routes';
import CandidatTable from '@/views/table/candidat';
import { redirect } from 'next/navigation';

const Profils = ({
  params: {
    props: [pageType, page],
  },
}: {
  params: { props: [pageType, string] };
}) => {
  if (isNaN(Number.parseInt(page, 10)) || Number.parseInt(page, 10) <= 0) {
    redirect(routes.pages['candidats'].reseauxResult([1]));
  }

  return (
    <>
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Vos Profils Recherchés
      </h1>
      <span className="text-foreground/60 text-h3">
        Retrouvez tous les candidats correspondant à vos critères
      </span>
      <CandidatTable pageType={pageType} page={page} />
    </>
  );
};

export default Profils;
