import { MailerServicesJest } from '@/interfaces/jest';
import MailerServiceFile from '@/services/mailer';
import Container from 'typedi';

export default function mailerMockedService(): MailerServicesJest {
  const MailerService = Container.get(MailerServiceFile);

  const Registration = jest.spyOn(MailerService, 'Registration');
  const TwoFactorAuthenticate = jest.spyOn(MailerService, 'TwoFactorAuthenticate');
  const Invoice = jest.spyOn(MailerService, 'Invoice');
  const Update_subscription = jest.spyOn(MailerService, 'Update_subscription');
  const Delete_subscription = jest.spyOn(MailerService, 'Delete_subscription');
  const New_invoice = jest.spyOn(MailerService, 'New_invoice');
  const Failed_subscription = jest.spyOn(MailerService, 'Failed_subscription');
  const Cancel_request = jest.spyOn(MailerService, 'Cancel_request');
  const ResetPassword = jest.spyOn(MailerService, 'ResetPassword');

  return {
    Registration,
    TwoFactorAuthenticate,
    Invoice,
    Update_subscription,
    Delete_subscription,
    New_invoice,
    Failed_subscription,
    Cancel_request,
    ResetPassword,
  };
}
