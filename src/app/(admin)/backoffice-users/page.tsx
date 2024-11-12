// import Pagination from '@/components/navigations/paginnation';
// import TableLayout from '@/components/tables';
// import authOptions from '@/config/authOption';
// import { ClientException } from '@/exceptions';
// import { paginationData } from '@/interfaces/scrapping';
import { role } from '@/interfaces/users';
// import routes from '@/routes';
// import PrepareServices from '@/services';
// import { getServerSession, Session } from 'next-auth';
// import { redirect } from 'next/navigation';

const UserOffice = async ({
  searchParams,
}: {
  searchParams: {
    limit?: number;
    page?: string;
    lastName?: string;
    firstName?: string;
    email?: string;
    role?: role;
  };
}) => {
  console.log(searchParams);

  // const { user: User } =
  //   ((await getServerSession(authOptions)) as Session) || {};

  // if (User.role !== 'admin') {
  //   redirect(routes.pages.unauthorized());
  // }

  // const { getAllUsers } = PrepareServices();

  // const [err, meta] = await getAllUsers(searchParams);

  // if (err) {
  //   throw new ClientException(
  //     500,
  //     'Une erreur inattendue est survenue avec la base de données, veuillez réessayer plus tard.',
  //   );
  // }

  // const paginationData: any = { pagesLength: Math.ceil(meta.total / 10) };
  // const currentPage = searchParams.page ?? '1';

  return (
    <main className="pl-10 xl:pl-14 pr-20 mt-10 xl:pr-32 h-full">
      <h1 className="text-3xl xl:text-4xl text-foreground/95 font-semibold mb-2">
        Administrateur
      </h1>
      <span className="text-foreground/60 text-base xl:text-lg">
        Gérer les différents comptes utilisateurs
      </span>
      <section className="w-full h-full mt-14">
        <span> En cours de maintenance</span>
        {/* <TableLayout userList={(meta as any).users} queries={searchParams} />
        <div className="w-full flex flex-row justify-center">
          <div className="p-1 mt-10 bg-content/20">
            <Pagination
              // isQueries
              routeParams={searchParams}
              className="w-fit pr-0 "
              data={paginationData}
              page={currentPage}
              routeDir={'userOffice'}
            /> 
          </div>
        </div>*/}
      </section>
    </main>
  );
};

export default UserOffice;
