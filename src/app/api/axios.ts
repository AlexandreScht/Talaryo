import { ExpiredSessionError, InvalidRoleAccessError } from '@/exceptions';
import { getRequestCookies, getServerUri, setRequestCookies } from '@/utils/cookies';
import axios from 'axios';
import { serialize } from 'cookie';

const AxiosRequest = ({ token }: { token?: string } = {}) => {
  return axios.create({
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
};

const AxiosInstance = ({ token }: { token?: string }) => {
  const serverRequest = typeof window === 'undefined';
  const instance = AxiosRequest({ token });
  instance.interceptors.response.use(
    async response => {
      const cookies = response.headers['set-cookie'];

      if (cookies?.length && serverRequest) {
        getRequestCookies(cookies);
      }

      return response;
    },
    error => {
      if (error?.response?.status === 605) {
        throw new InvalidRoleAccessError(error.response?.data?.error);
      }
      if (error?.response?.status === 999 && error.response?.data?.error === 'Session expired') {
        throw new ExpiredSessionError();
      }
      return Promise.reject(error);
    },
  );
  instance.interceptors.request.use(async request => {
    if (serverRequest) {
      const cookies = await setRequestCookies();
      const formattedCookies = cookies
        ?.map(cookie => {
          const { name, value, ...options } = cookie;
          return serialize(name, value, options);
        })
        .join('; ');

      if (formattedCookies?.length) {
        request.headers['Cookie'] = formattedCookies;
      }
    }
    const baseURI = await getServerUri();
    request.baseURL = `${baseURI}/api`;

    return request;
  });

  return instance;
};

export default AxiosInstance;
