import { getErrorMessage } from '@/exceptions/errorMessage';
import type { mainParams } from '@/interfaces/components';
import {
  candidateDataProps,
  personalDataProps,
  scrappingCVProps,
  scrappingReseauProps,
} from '@/interfaces/scrapping';
import type { ResponseType } from '@/interfaces/services';
import {
  cvContentValidator,
  scrappingCVSchemaValidator,
  scrappingEmailSchemaValidator,
  scrappingSearchSchemaValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import revalidatePaths from '@/utils/revalidateCache';
import type { AxiosInstance } from 'axios';
const {
  api: { scrapping: router },
} = routes;
export const scrappingSearchService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    props: MakeKeyRequired<mainParams, 'platform'>,
  ): Promise<
    ResponseType<{
      data: Omit<candidateDataProps, 'inStream'>;
      links: scrappingReseauProps[];
    }>
  > => {
    try {
      validator(scrappingSearchSchemaValidator, props);
      const { data } = await axios.get(router.scrapSearch(props as any));

      revalidatePaths([routes.pages.home()]);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const scrappingCVService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (
    props: mainParams,
  ): Promise<
    ResponseType<{
      data: Omit<candidateDataProps, 'inStream'>;
      links: Omit<scrappingCVProps, 'link' | 'isEnd'>[];
    }>
  > => {
    try {
      validator(scrappingCVSchemaValidator, props);
      const { data } = await axios.get(router.scrapCV(props as any));

      revalidatePaths([routes.pages.home()]);

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const cvContentService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (link: string): Promise<ResponseType<string>> => {
    try {
      validator(cvContentValidator, { link });

      const {
        data: { editedPDF },
      } = await axios.get(router.cvContent([link]));

      return { res: editedPDF };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const scrappingPersonalDataService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: {
    firstName: string;
    lastName: string;
    company: string;
    link?: string;
  }): Promise<ResponseType<true | personalDataProps>> => {
    try {
      validator(scrappingEmailSchemaValidator, props);
      const {
        data: { res },
      } = await axios.get(router.scrapMail(props));
      return { res: res || true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
