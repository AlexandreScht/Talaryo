// import type { mainParams } from '@/interfaces/components';
// import type { ResponseType } from '@/interfaces/services';
// import errAxiosRes from '@/libs/errRes';
// import { scrappingCVSchemaValidator } from '@/libs/valideModules';
// import validator from '@/middlewares/validator';
// import routes from '@/routes';
// import revalidatePaths from '@/utils/revalidateCache';
// import type { AxiosInstance } from 'axios';

// export const trainingIAService =
//   ({ axios }: { axios: AxiosInstance }) =>
//   async (values: unknown): Promise<ResponseType<void>> => {
//     try {
//       validator(scrappingCVSchemaValidator, values as mainParams);
//       const { data } = await axios.get(routes.api.trainingIA(values));

//       if (data) {
//         revalidatePaths([routes.pages.home()]);
//       }
//       return [null, data];
//     } catch (err: unknown) {
//       return errAxiosRes(err);
//     }
//   };
