import config from '@/config';
import { ServicesError } from '@/exceptions';
import { brevoAPI, dropContactAPI, signalHireAPI } from '@/utils/axiosConfig';
import { logger } from '@/utils/logger';
import axios from 'axios';
import { Service } from 'typedi';

@Service()
export default class ApiServiceFile {
  public async FetchMailRequestId({ first_name, last_name, company }: { first_name: string; last_name: string; company: string }) {
    try {
      const {
        data: { request_id },
      } = await dropContactAPI.post(
        '/batch',
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
          },
        },
      );
      return request_id;
    } catch (error) {
      logger.error('ApiService.FetchMailRequestId => ', error);
      throw new ServicesError();
    }
  }

  public async FetchMailData(requestId: string) {
    try {
      const {
        data: {
          data: [{ email }],
        },
      } = await dropContactAPI.get(`/batch/${requestId}?forceResults=true`);

      return email;
    } catch (error) {
      logger.error('ApiService.FetchMailData => ', error);
      throw new ServicesError();
    }
  }

  public async SendSignalHireRequest(link: string, callbackUrl: string) {
    try {
      const {
        data: { requestId },
      } = await signalHireAPI.post('/candidate/search', {
        items: [link],
        callbackUrl: `${callbackUrl}/webhook/`,
      });

      return requestId;
    } catch (error) {
      logger.error('ApiService.SendSignalHireRequest => ', error);
      throw new ServicesError();
    }
  }

  public async FetchRecaptchaIdentity(response: string) {
    try {
      const { data } = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: config.apiKey.CAPTCHA_KEY,
          response,
        },
      });
      return data.success && new URL(config.ORIGIN).hostname === data.hostname;
    } catch (error) {
      logger.error('ApiService.FetchRecaptchaIdentity => ', error);
      throw new ServicesError();
    }
  }

  public async CreateBrevoUser({ email, firstName, lastName, google }: { email: string; firstName: string; lastName: string; google: boolean }) {
    try {
      await brevoAPI.post(`/contacts`, {
        email: email,
        attributes: {
          prenom: firstName,
          nom: lastName,
        },
        listIds: [google ? 8 : 9, 6],
      });
    } catch (error) {
      logger.error('ApiService.CreateBrevoUser => ', error);
    }
  }

  public async removeContactFromList(email: string, listId: number) {
    try {
      await brevoAPI.post(`/contacts/lists/${listId}/contacts/remove`, {
        emails: [email],
      });
    } catch (error) {
      logger.error('ApiService.removeContactFromList => ', error);
    }
  }

  public async UpdateBrevoUser({
    email,
    firstName,
    lastName,
    society,
    tags,
    removeTags,
  }: {
    email: string;
    firstName?: string;
    society?: string;
    lastName?: string;
    tags?: number[];
    removeTags?: number[];
  }) {
    try {
      if (removeTags?.length) {
        const promises = removeTags.map(id => this.removeContactFromList(email, id));
        await Promise.all(promises);
      }

      await brevoAPI.put(`/contacts/${encodeURIComponent(email)}`, {
        ...(firstName || lastName || society
          ? {
              attributes: {
                ...(firstName ? { prenom: firstName } : {}),
                ...(lastName ? { nom: lastName } : {}),
                ...(society ? { society } : {}),
              },
            }
          : {}),
        ...(tags?.length ? { listIds: tags } : {}),
      });
    } catch (error) {
      logger.error('ApiService.UpdateBrevoUser => ', error);
      throw new ServicesError();
    }
  }
}
