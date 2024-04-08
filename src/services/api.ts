import config from '@/config';
import { ServicesError } from '@/exceptions';

import axios from 'axios';
import { Service } from 'typedi';

@Service()
class ApiServiceFile {
  public async FetchMailRequestId({ first_name, last_name, company }: { first_name: string; last_name: string; company: string }) {
    try {
      const {
        apiKey: { emailKey },
      } = config;
      const {
        data: { request_id },
      } = await axios.post(
        'https://api.dropcontact.io/batch',
        {
          data: [
            {
              first_name,
              last_name,
              full_name: `${first_name} ${last_name}`,
              company,
            },
          ],
          siren: true,
          language: 'en',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': emailKey,
          },
        },
      );
      return request_id;
    } catch (error) {
      throw new ServicesError();
    }
  }

  public async FetchMailData(requestId: string) {
    try {
      const {
        apiKey: { emailKey },
      } = config;
      const {
        data: {
          data: [{ email }],
        },
      } = await axios.get(`https://api.dropcontact.io/batch/${requestId}?forceResults=true`, {
        headers: {
          'X-Access-Token': emailKey,
        },
      });

      return [!!email, email];
    } catch (error) {
      throw new ServicesError();
    }
  }
}

export default ApiServiceFile;
