import config from '@/config';
import axios from 'axios';
const {
  apiKey: { EMAILKEY, BREVOKEY },
} = config;

export const brevoAPI = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': BREVOKEY,
    'Content-Type': 'application/json',
  },
});

export const dropContactAPI = axios.create({
  baseURL: 'https://api.dropcontact.io',
  headers: {
    'X-Access-Token': EMAILKEY,
  },
});

export const signalHireAPI = axios.create({
  baseURL: 'https://www.signalhire.com/api/v1',
  headers: {
    apikey: EMAILKEY,
  },
});
