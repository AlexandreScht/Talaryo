import config from '@config';
import { MailerError } from '@exceptions';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { Service } from 'typedi';
import util from 'util';

const { mailer } = config;

@Service()
class MailerServiceFile {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailer.HOST,
      port: parseInt(mailer.PORT),
      // requireTLS: true,
      auth: {
        user: mailer.USER,
        pass: mailer.PASSWORD,
      },
    });
  }

  private async sendMailAsync(mailOptions: nodemailer.SendMailOptions): Promise<void> {
    try {
      const sendMail = util.promisify(this.transporter.sendMail).bind(this.transporter);

      await sendMail(mailOptions);
    } catch (error) {
      console.log(error);

      throw new MailerError();
    }
  }

  public async Registration(email: string, firstName: string, userCode: number): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'registration-mail.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail.replace('{{support_MAIL}}', mailer.USER).replace('{{code}}', `${userCode}`).replace('{{user}}', firstName);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: 'Validez votre inscription - JobFiller',
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async TwoFactorAuthenticate(email: string, firstName: string, userCode: number): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'two-factor-authentication.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail.replace('{{support_MAIL}}', mailer.USER).replace('{{code}}', `${userCode}`).replace('{{user}}', firstName);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: 'Votre code 2FA - JobFiller',
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }
}

export default MailerServiceFile;
