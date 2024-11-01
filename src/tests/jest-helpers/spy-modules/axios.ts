import { AxiosJest } from '@/interfaces/jest';
import axios from 'axios';

export default function axiosMocked(): AxiosJest {
  const get = jest.spyOn(axios, 'get');
  const del = jest.spyOn(axios, 'delete');
  const patch = jest.spyOn(axios, 'patch');
  const put = jest.spyOn(axios, 'put');
  const post = jest.spyOn(axios, 'post');

  return {
    get,
    del,
    patch,
    put,
    post,
  };
}
