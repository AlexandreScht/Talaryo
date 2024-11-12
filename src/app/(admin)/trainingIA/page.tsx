// import StartSearch from '@/components/buttons/start';
// import ToggleButton from '@/components/buttons/togglle';
// import Chip from '@/components/card/chip';
// import Input from '@/components/inputs';
// import DatePicker from '@/components/inputs/select/datePicker';
// import Localisation from '@/components/inputs/select/localisation';
// import Slider from '@/components/inputs/slider';
// import nextAuthOptions from '@/config/authOption';
import { mainParams } from '@/interfaces/components';
// import routes from '@/routes';

// import TrainingIo from '@/views/training/page';
// import { getServerSession, Session } from 'next-auth';
// import { redirect } from 'next/navigation';
// import { ToastContainer } from 'react-toastify';

const TrainingIa = async ({
  searchParams,
}: {
  searchParams: mainParams & { link?: string };
}) => {
  console.log(searchParams);

  // const { user: User } =
  //   ((await getServerSession(nextAuthOptions)) as Session) || {};

  // if (User.role !== 'admin') {
  //   redirect(routes.pages.unauthorized());
  // }
  // const { link } = searchParams || {};

  return (
    <div className="w-full h-[100vh] flex justify-center items-center">
      <h1 className="text-h1">En maintenance</h1>
    </div>
  );

  // if (link === 'none') {
  //   return (
  //     <div className="w-full h-[100vh] flex justify-center items-center">
  //       <h1 className="text-h1">Aucun resultat</h1>
  //     </div>
  //   );
  // }

  // return link ? (
  //   <>
  //     <TrainingIo link={link} />
  //     <ToastContainer
  //       position="bottom-right"
  //       theme="colored"
  //       autoClose={3000}
  //       closeOnClick
  //       pauseOnFocusLoss
  //       draggable={true}
  //       pauseOnHover
  //     />
  //   </>
  // ) : (
  //   <section className="w-full pt-16 h-full flex flex-row items-center justify-center">
  //     <div className="w-1/2 h-fit flex flex-col items-center">
  //       <h2 className="text-h3 md:mt-3 lg:mt-3 xl:mt-7 font-semibold text-foreground/90">
  //         Training IA
  //       </h2>
  //       <div className="flex h-full flex-col w-[85%] lg:w-[70%] mt-5 lg:mt-6 xl:mt-12 items-center relative space-y-[0.9rem] lg:space-y-[0.95rem] xl:space-y-3">
  //         <Input
  //           label="Fonction(s)"
  //           className="pr-0.5"
  //           searchParams={{ props: searchParams, params: 'fn' }}
  //         />

  //         <div className="grid grid-cols-2 w-full gap-x-5">
  //           <Input
  //             className="pr-0.5"
  //             label="Formation"
  //             searchParams={{ props: searchParams, params: 'formation' }}
  //           />
  //           <DatePicker />
  //         </div>

  //         <div className="grid grid-cols-2 w-full gap-x-5">
  //           <Input
  //             className="pr-0.5"
  //             label="Entreprise"
  //             searchParams={{ props: searchParams, params: 'industry' }}
  //           />
  //           <Input
  //             className="pr-0.5"
  //             label="Exclure Entreprise"
  //             searchParams={{ props: searchParams, params: 'Nindustry' }}
  //           />
  //         </div>
  //         <div className="grid grid-cols-2 w-full gap-x-5">
  //           <div className="w-full flex justify-end">
  //             <ToggleButton params="time" value={undefined}>
  //               Actuelle
  //             </ToggleButton>
  //           </div>
  //           <ToggleButton params="time" value={true}>
  //             Indifférent
  //           </ToggleButton>
  //         </div>
  //         <Input
  //           label="Secteur"
  //           searchParams={{ props: searchParams, params: 'sector' }}
  //         />
  //         <div className="grid grid-cols-2 grid-rows-2 w-full gap-x-5 gap-y-[0.9rem] lg:gap-y-[0.95rem] xl:gap-y-3">
  //           <Input
  //             className="pr-0.5"
  //             label="Compétence(s)"
  //             searchParams={{ props: searchParams, params: 'skill' }}
  //           />
  //           <Input
  //             className="pr-0.5"
  //             label="Exclure Compétence(s)"
  //             searchParams={{ props: searchParams, params: 'Nskill' }}
  //           />
  //           <Input
  //             className="pr-0.5"
  //             label="Mots-clé(s)"
  //             searchParams={{ props: searchParams, params: 'key' }}
  //           />
  //           <Input
  //             className="pr-0.5"
  //             label="Exclure Mots-clé(s)"
  //             searchParams={{ props: searchParams, params: 'Nkey' }}
  //           />
  //         </div>
  //         <Localisation
  //           limit={searchParams.zone ? 3 : 1}
  //           searchParams={{ props: searchParams, params: 'loc' }}
  //           classNames={{ wrapper: 'my-3 xl:my-5' }}
  //           label={(searchParams.zone ? 'Commune' : 'Région') + '(s)'}
  //           message="Limiter les recherches aux zones choisies."
  //         />
  //       </div>
  //       <div className="grid grid-cols-2 w-full gap-x-5 mt-[0.9rem] lg:mt-[0.95rem] xl:mt-3">
  //         <div className="w-full flex justify-end">
  //           <ToggleButton params="zone" value={undefined}>
  //             Région
  //           </ToggleButton>
  //         </div>
  //         <ToggleButton
  //           params="zone"
  //           value={true}
  //           classNames="w-24 lg:w-28 xl:w-32"
  //         >
  //           Commune(s)
  //         </ToggleButton>
  //       </div>
  //       <div className="w-[85%] lg:w-[70%] lg:mb-3 xl:mb-5 flex flex-row items-center mt-[0.9rem] lg:mt-[0.95rem] xl:mt-3 md:py-[0.3rem] xl:py-[0.36rem] md:pl-1 lg:pl-1.5 md:pr-2 lg:pr-3 !rounded-lg bg-content shadow-border hover:border-gradient">
  //         <span className="text-p3 !text-foreground/70 ml-2">Matching</span>
  //         <Slider
  //           min={20}
  //           max={80}
  //           step={5}
  //           defaultValue={
  //             !isNaN(Number(searchParams?.matching))
  //               ? Number(searchParams?.matching)
  //               : 50
  //           }
  //           className="w-full flex flex-row"
  //           classNames={{
  //             default: {
  //               base: 'pl-10 pr-3 block',
  //               trackWrapper: 'h-full',
  //               track: 'bg-foreground/75 h-2',
  //               filler:
  //                 'bg-gradient-to-r from-secondary to-primary -ml-3 rounded-l-md h-2',
  //             },
  //           }}
  //         >
  //           <Chip className="py-1 w-fit ml-[2%] mr-2 my-[0.1rem]">
  //             <div className="w-10 flex flex-row justify-center text-white !text-p3">
  //               <span></span>
  //               <span className="font-light ml-0.5">%</span>
  //             </div>
  //           </Chip>
  //         </Slider>
  //       </div>
  //       <StartSearch
  //         page="cv"
  //         training={true}
  //         searchParams={searchParams}
  //         className="relative font-medium !text-p3 text-white/95 bg-gradient-to-bl from-primary to-secondary rounded-md border-1 border-primary w-[27vw] lg:w-[25vw] xl:w-[22vw] h-fit min-h-0 py-2 lg:py-[0.575rem] mt-5"
  //       >
  //         Commencer l&#39;entrainement
  //       </StartSearch>
  //     </div>
  //   </section>
  // );
};

export default TrainingIa;
