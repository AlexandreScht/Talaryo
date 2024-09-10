import config from '@/config';
import { ServicesError } from '@/exceptions';
import axios from 'axios';
import { Service } from 'typedi';

@Service()
class ApiServiceFile {
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
      throw new ServicesError();
    }
  }
}

export default ApiServiceFile;
