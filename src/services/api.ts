import config from '@/config';
import { ServicesError } from '@/exceptions';
import { brevoAPI, dropcontactAPI } from '@/utils/axiosConfig';
import { logger } from '@/utils/logger';
import axios from 'axios';
import { Service } from 'typedi';

@Service()
class ApiServiceFile {
  public async FetchMailRequestId({ first_name, last_name, company }: { first_name: string; last_name: string; company: string }) {
    try {
      const {
        data: { request_id },
      } = await dropcontactAPI.post(
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
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async FetchMailData(requestId: string) {
    try {
      const {
        data: {
          data: [{ email }],
        },
      } = await dropcontactAPI.get(`/batch/${requestId}?forceResults=true`);

      return [!!email, email];
    } catch (error) {
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async FetchRecaptchaIdentity(response: string) {
    try {
      const { data } = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
        params: {
          secret: config.CAPTCHA_KEY,
          response,
        },
      });
      return data.success && new URL(config.ORIGIN).hostname === data.hostname;
    } catch (error) {
      logger.error(error);
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
      logger.error(error);
      throw new ServicesError();
    }
  }

  public async removeContactFromList(email: string, listId: number) {
    try {
      await brevoAPI.post(`/contacts/lists/${listId}/contacts/remove`, {
        emails: [email],
      });
    } catch (error) {
      logger.error(error);
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
      logger.error(error);
      throw new ServicesError();
    }
  }
}

export default ApiServiceFile;
