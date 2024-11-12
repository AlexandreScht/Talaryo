import { getErrorMessage } from '@/exceptions/errorMessage';
import { cancelStripeOptions, fetchSub } from '@/interfaces/payement';
import type { ResponseType } from '@/interfaces/services';
import { invoicesProps } from '@/interfaces/subscribe';
import {
  cancelSubscribeValidator,
  createSubscribeValidator,
} from '@/libs/valideModules';
import validator from '@/middlewares/validator';
import routes from '@/routes';
import type { AxiosInstance } from 'axios';

const {
  api: { subscribe: router },
} = routes;

export const cancelSubscribeService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: {
    subId: string;
    option?: cancelStripeOptions;
  }): Promise<ResponseType<true>> => {
    try {
      validator(cancelSubscribeValidator, props);
      await axios.patch(router.cancelSub(), props);

      return { res: true };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const getSubscribeService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (): Promise<ResponseType<fetchSub>> => {
    try {
      const { data } = await axios.get(router.getCurrentSub());

      return { res: data };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const updateSubscribeService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: {
    price_id: string;
    itemSub: string;
    subId: string;
  }): Promise<ResponseType<string>> => {
    try {
      validator(cancelSubscribeValidator, props);
      const {
        data: { url },
      } = await axios.patch(router.updateSub(), props);

      return { res: url };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const createSubscribeService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (props: string): Promise<ResponseType<string>> => {
    try {
      validator(createSubscribeValidator, { price_id: props });

      const {
        data: { url },
      } = await axios.post(router.createSub(), { price_id: props });

      return { res: url };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };

export const getInvoicesService =
  ({ axios }: { axios: AxiosInstance }) =>
  async (): Promise<ResponseType<invoicesProps>> => {
    try {
      const {
        data: { invoices },
      } = await axios.get(router.getInvoices());

      return { res: invoices };
    } catch (err: unknown) {
      return getErrorMessage(err);
    }
  };
