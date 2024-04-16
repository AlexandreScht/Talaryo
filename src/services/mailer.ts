import { role } from '@/interfaces/models';
import { payment } from '@/interfaces/request';
import config from '@config';
import { MailerError } from '@exceptions';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import { Service } from 'typedi';
import util from 'util';

const { mailer, ORIGIN } = config;

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

  public async Confirmation(email: string, firstName: string, userToken: string): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'confirmation-mail.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{support_MAIL}}', mailer.USER)
        .replace('{{url}}', ORIGIN + `?token=${encodeURIComponent(userToken)}`)
        .replace('{{user}}', firstName);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: "Confirmation d'email - Talaryo",
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async Invoice({
    email,
    invoice_link,
    invoice_amount,
    invoice_date,
    user,
  }: {
    email: string;
    invoice_link: string;
    invoice_amount: string;
    invoice_date: number;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'invoices.html'), { encoding: 'utf-8' });
      const [day, month, year] = new Date(invoice_date).toLocaleDateString('fr-FR').split('/');
      const htmlMailer = confirmationEmail
        .replace('{{invoice_link}}', invoice_link)
        .replace('{{user}}', user)
        .replace('{{invoice_date}}', `${day}/${month}/${year}`)
        .replace('{{invoice_amount}}', invoice_amount);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Facture du ${month}/${year.slice(-2)} - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async Update_subscription({
    email,
    old_name_plan,
    old_price_plan,
    old_period_plan,
    new_name_plan,
    new_price_plan,
    new_period_plan,
    next_invoice_date,
    invoice_link,
    user,
  }: {
    email: string;
    old_name_plan: string;
    old_price_plan: string;
    old_period_plan: string;
    new_name_plan: string;
    new_price_plan: string;
    new_period_plan: string;
    next_invoice_date: string;
    invoice_link: string;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'update-invoice.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{old_name_plan}}', old_name_plan)
        .replace('{{old_price_plan}}', old_price_plan)
        .replace('{{old_period_plan}}', old_period_plan)
        .replace('{{new_name_plan}}', new_name_plan)
        .replace('{{new_price_plan}}', new_price_plan)
        .replace('{{new_period_plan}}', new_period_plan)
        .replace('{{next_invoice_date}}', next_invoice_date)
        .replace('{{invoice_link}}', invoice_link)
        .replace('{{user}}', user)
        .replace('{{support_MAIL}}', mailer.USER);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Confirmation de changement d'abonnement - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async Delete_subscription({
    email,
    plan,
    invoice_amount,
    invoice_date,
    user,
  }: {
    email: string;
    plan: role;
    invoice_amount: string;
    invoice_date: string;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'end_subscription.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{plan}}', plan)
        .replace('{{user}}', user)
        .replace('{{invoice_date}}', invoice_date)
        .replace('{{invoice_price}}', invoice_amount);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Annulation de votre abonnement - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async New_invoice({
    email,
    invoice_link,
    invoice_amount,
    invoice_next_date,
    period_plan,
    name_plan,
    user,
  }: {
    email: string;
    invoice_link: string;
    invoice_amount: string;
    invoice_next_date: string;
    period_plan: string;
    name_plan: string;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'new-invoice.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{user}}', user)
        .replace('{{name_plan}}', name_plan)
        .replace('{{period_plan}}', period_plan)
        .replace('{{invoice_next_date}}', invoice_next_date)
        .replace('{{invoice_amount}}', invoice_amount)
        .replace('{{invoice_link}}', invoice_link)
        .replace('{{support_MAIL}}', mailer.USER);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Confirmation de souscription à votre abonnement - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async Failed_subscription({
    email,
    name_plan,
    payment_data,
    invoice_link,
    purchase_end,
    user,
  }: {
    email: string;
    name_plan: role;
    payment_data: payment;
    invoice_link: string;
    purchase_end: string;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'invoices-failed.html'), { encoding: 'utf-8' });
      const isCard = payment_data.payment_method === 'card';
      const mail_payment = {
        //? key
        info: isCard ? 'Type de carte' : "Email de l'utilisateur",
        detail: isCard ? 'Numéros  de carte' : "Nom de l'utilisateur",
        specific: isCard ? 'Date d’expiration de la carte' : 'Transaction Paypal',
        // ?value
        platform_value: payment_data.payment_method,
        info_value: isCard ? payment_data.brand : payment_data.payer_email,
        detail_value: isCard ? `**** **** **** ${payment_data.card_number}` : payment_data.payer_name,
        specific_value: isCard
          ? `${payment_data.exp_month < 10 ? '0' + payment_data.exp_month : payment_data.exp_month}/${payment_data.exp_year % 100}`
          : payment_data.transaction_id,
      };
      const htmlMailer = confirmationEmail
        .replace('{{user}}', user)
        .replace('{{name_plan}}', name_plan)
        .replace('{{platform_value}}', mail_payment.platform_value)
        .replace('{{info}}', mail_payment.info)
        .replace('{{info_value}}', mail_payment.info_value)
        .replace('{{detail}}', mail_payment.detail)
        .replace('{{detail_value}}', mail_payment.detail_value)
        .replace('{{specific}}', mail_payment.specific)
        .replace('{{specific_value}}', mail_payment.specific_value)
        .replace('{{purchase_end}}', purchase_end)
        .replace('{{invoice_link}}', invoice_link)
        .replace('{{support_MAIL}}', mailer.USER);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Veuillez renouvelez votre abonnement - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async Cancel_request({
    email,
    plan,
    invoice_amount,
    cancel_date,
    user,
  }: {
    email: string;
    plan: role;
    invoice_amount: string;
    cancel_date: string;
    user: string;
  }): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'cancel_subscription.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{name_plan}}', plan)
        .replace('{{user}}', user)
        .replace('{{cancel_date}}', cancel_date)
        .replace('{{invoice_price}}', invoice_amount)
        .replace('{{support_MAIL}}', mailer.USER);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: `Demande d'annulation de votre abonnement - Talaryo`,
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }

  public async ResetPassword(email: string, token: string): Promise<void> {
    try {
      const templateDir: string = join(__dirname, mailer.DIR);
      const confirmationEmail = fs.readFileSync(join(templateDir, 'reset-password.html'), { encoding: 'utf-8' });
      const htmlMailer = confirmationEmail
        .replace('{{support_MAIL}}', mailer.USER)
        .replace('{{url}}', ORIGIN + `/reset-password/new?token=${encodeURIComponent(token)}`);

      const mailOptions = {
        from: mailer.USER,
        to: email,
        subject: 'Lien de réinitialisation de mot de passe - Talaryo',
        html: htmlMailer,
      };

      await this.sendMailAsync(mailOptions);
    } catch (error) {
      throw new MailerError();
    }
  }
}

export default MailerServiceFile;
