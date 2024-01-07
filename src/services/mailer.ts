import config from '@config';
import { MailerError } from '@exceptions';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { Service } from 'typedi';
import util from 'util';

const { mailer, FRONT_URL } = config;

@Service()
class MailerServiceFile {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: mailer.HOST,
      port: parseInt(mailer.PORT),
      // secure: true,
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

  public async Confirmation(email: string, firstName: string, userToken: string): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'confirmation-mail.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{support_MAIL}}', mailer.USER)
        .replace('{{url}}', FRONT_URL + `?token=${encodeURIComponent(userToken)}`)
        .replace('{{user}}', firstName);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: "Confirmation d'email - Profiilo",
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      console.log(error);
      throw new MailerError();
    }
  }

  public async ResetPassword(email: string, token: string): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'reset-password.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{support_MAIL}}', mailer.USER)
        .replace('{{url}}', FRONT_URL + `/reset-password/new?token=${encodeURIComponent(token)}`);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: 'Lien de réinitialisation de mot de passe - Profiilo',
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }
}

export default MailerServiceFile;
