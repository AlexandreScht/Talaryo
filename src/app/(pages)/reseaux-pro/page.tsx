import StartSearch from '@/components/buttons/start';
import ToggleButton from '@/components/buttons/togglle';
import Input from '@/components/inputs';
import SelectMenu from '@/components/inputs/choice';
import Localisation from '@/components/inputs/select/localisation';
import LimitSlider from '@/components/navbar/limitSlider';
import { ProAlumni, ProReseaux, ProSpecial } from '@/config/SelectMenuItems';
import nextAuthOptions from '@/config/authOption';
import type { mainParams } from '@/interfaces/components';
import LeftPagesSide from '@/views/LayoutPages';
import { getServerSession, Session } from 'next-auth';

const Pro = async ({ searchParams }: { searchParams: mainParams }) => {
  const { user: User } =
    ((await getServerSession(nextAuthOptions)) as Session) || {};
  const maxItems = 15;

  const itemsLength = Object.entries(searchParams)
    .flatMap((items) => {
      if (
        items[0] !== 'platform' &&
        items[0] !== 'time' &&
        items[0] !== 'zone' &&
        items[0] !== 'loc' &&
        items[1]
      ) {
        return typeof items[1] === 'string' ? items[1].split(',') : undefined;
      }
    })
    .filter((v) => v).length;

  const canAddItems = itemsLength >= maxItems;

  return (
    <>
      <LimitSlider progression={Math.round((itemsLength / maxItems) * 100)} />
      <h1 className="text-h1 text-foreground/95 font-semibold md:mb-1 lg:mb-1.5 xl:mb-2">
        Réseaux Professionnels
      </h1>
      <span className="text-foreground/60 text-h3">Recherche de candidats</span>
      <section className="w-full lg:mb-1.5 lg:mt-1 xl:mt-2 flex flex-row justify-between">
        <div className="w-[68%] lg:w-[70%] h-fit flex flex-col items-center">
          <h2 className="text-h3 md:mt-3 lg:mt-3 xl:mt-7 font-semibold text-foreground/90">
            Votre Recherche
          </h2>
          <span className="text-foreground/60 text-center text-p3 md:mt-1 lg:mt-3">
            Attention, les résultats peuvent varier selon la présence ou
            l&#39;absence d&#39;une lettre supplémentaire !
          </span>
          <div className="flex h-full flex-col w-[85%] lg:w-[70%] mt-5 lg:mt-6 xl:mt-12 items-center relative space-y-[0.9rem] lg:space-y-[0.95rem] xl:space-y-3">
            <div className="w-full">
              <SelectMenu
                maxItems={5}
                multiple
                User={User}
                searchParams={searchParams}
                label="Choisissez vos plateformes"
                items={[ProReseaux, ProSpecial, ProAlumni]}
              />
            </div>

            <Input
              maxItems={canAddItems}
              label="Fonction(s)"
              className="pr-0.5"
              searchParams={{ props: searchParams, params: 'fn' }}
            />

            <div className="grid grid-cols-2 w-full gap-x-5">
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Entreprise"
                searchParams={{ props: searchParams, params: 'industry' }}
              />
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Exclure Entreprise"
                searchParams={{ props: searchParams, params: 'Nindustry' }}
              />
            </div>
            <div className="grid grid-cols-2 w-full gap-x-5">
              <div className="w-full flex justify-end">
                <ToggleButton params="time" value={undefined}>
                  Actuelle
                </ToggleButton>
              </div>
              <ToggleButton params="time" value={true}>
                Indifférent
              </ToggleButton>
            </div>
            <Input
              maxItems={canAddItems}
              label="Secteur"
              searchParams={{ props: searchParams, params: 'sector' }}
            />
            <div className="grid grid-cols-2 grid-rows-2 w-full gap-x-5 gap-y-[0.9rem] lg:gap-y-[0.95rem] xl:gap-y-3">
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Compétence(s)"
                searchParams={{ props: searchParams, params: 'skill' }}
              />
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Exclure Compétence(s)"
                searchParams={{ props: searchParams, params: 'Nskill' }}
              />
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Mots-clé(s)"
                searchParams={{ props: searchParams, params: 'key' }}
              />
              <Input
                className="pr-0.5"
                maxItems={canAddItems}
                label="Exclure Mots-clé(s)"
                searchParams={{ props: searchParams, params: 'Nkey' }}
              />
            </div>
            <Localisation
              limit={searchParams.zone ? 3 : 1}
              searchParams={{ props: searchParams, params: 'loc' }}
              classNames={{ wrapper: 'my-3 xl:my-5' }}
              label={(searchParams.zone ? 'Commune' : 'Région') + '(s)'}
              message="Limiter les recherches aux zones choisies."
            />
          </div>
          <div className="grid grid-cols-2 lg:mb-3 xl:mb-5 w-full gap-x-5 mt-[0.9rem] lg:mt-[0.95rem] xl:mt-3">
            <div className="w-full flex justify-end">
              <ToggleButton
                params="zone"
                value={undefined}
                classNames="lg:w-28 xl:w-32"
              >
                Région
              </ToggleButton>
            </div>
            <ToggleButton
              params="zone"
              value={true}
              classNames="lg:w-28 xl:w-32"
            >
              Commune(s)
            </ToggleButton>
          </div>
          <StartSearch
            page="pro"
            searchParams={searchParams}
            className="relative font-medium !text-p3 text-white/95 bg-gradient-to-bl from-primary to-secondary rounded-md border-1 border-primary w-[27vw] lg:w-[25vw] xl:w-[22vw] h-fit min-h-0 py-2 lg:py-[0.575rem] mt-5 mb-2"
          >
            Lancer la recherche
          </StartSearch>
        </div>
        <div className="w-1/4 flex flex-col justify-center">
          <div className="w-full h-5/6 flex flex-col justify-center">
            <LeftPagesSide pageType="pro" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Pro;
