import LastFavSave from '@/components/card/LastFavorite';
import { pageType } from '@/interfaces/services';
import routes from '@/routes';
import PrepareServices from '@/services';
import cn from '@/utils/cn';
import Link from 'next/link';
const FavCard = async ({
  className,
  limit = 3,
  titleClass,
  pageType,
}: {
  className?: string;
  titleClass?: string;
  limit?: number;
  pageType?: pageType;
}) => {
  const { getFavoris } = PrepareServices();

  const { err, res: fav } = await getFavoris({
    limit,
    ...(pageType ? { isCv: pageType === 'cv' } : {}),
  });

  const emptyLength = () => {
    const diff = limit - ((fav?.results?.length as any) || 0);
    return diff <= 0 ? [] : Array.from({ length: diff }, (_, index) => index);
  };
  const emptyList = emptyLength();

  if (!!err) {
    return (
      <article
        className={cn(
          'rounded-xl py-4 lg:py-0 lg:min-h-[6rem] xl:min-h-[7rem] w-full bg-content shadow-inner flex flex-col justify-center items-center',
          className,
        )}
      >
        <span className="w-full text-center text-foreground/90 text-p1 font-medium">Une erreur est survenue</span>
        <span className="w-full text-center mt-2 text-foreground/90 text-p1 font-medium">Veuillez réessayer plus tard</span>
      </article>
    );
  }

  return !err && !!fav?.results?.length ? (
    <article className={cn('rounded-xl', className)}>
      <div className="flex justify-between px-2 md:items-end xl:items-start">
        <h2 className={cn('text-h4 text-foreground/90 font-medium', titleClass)}>Derniers talents en favoris</h2>
        <Link href={routes.pages.favoris()} className="text-i2 text-foreground/75 text-right w-14 cursor-pointer hover:font-medium xl:mb-1">
          Tout voir
        </Link>
      </div>
      {fav.results.map((v, i) => (
        <LastFavSave key={i} link={v.link} currentJob={v.currentJob} img={v.img} fullName={v.fullName} />
      ))}
      {!!emptyList.length &&
        emptyList.map(v => (
          <div
            key={v}
            className="w-full bg-content/25 bg-border-dashed rounded-lg md:px-1 p-1.5 xl:p-2 flex flex-row items-center justify-between relative"
            style={{
              border: '1px dashed transparent',
              backgroundImage: 'var(--tw-gradient-stops)',
              backgroundSize: 'var(--tw-bg-size)',
              backgroundPosition: 'var(--tw-bg-position)',
              backgroundRepeat: 'var(--tw-bg-repeat)',
            }}
          >
            <div className="w-full flex justify-center items-center md:h-7 lg:h-10 xl:h-12">
              <span className="h-fit text-foreground/80 text-p2">Ajoutez d&apos;autres favoris pour les visualiser</span>
            </div>
          </div>
        ))}
    </article>
  ) : (
    <article className={cn('rounded-xl w-full bg-content shadow-inner flex flex-col justify-center items-center', className)}>
      <span className="text-foreground/90 text-p1 pt-10 font-medium">Ajoutez des favoris</span>
      <span className="text-foreground/90 text-p1 pb-10 font-medium">pour les visualiser ici</span>
    </article>
  );
};

export default FavCard;
