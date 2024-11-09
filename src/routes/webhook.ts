import SignalHireWebhook from '@/webhooks/signalHire';
import StripeWebhook from '@/webhooks/stripe';
import { Router } from 'express';
import Container from 'typedi';

export class WebhookRouter {
  public router = Router();
  private StripeWebhook: StripeWebhook;
  private SignalHireWebhook: SignalHireWebhook;

  constructor() {
    this.StripeWebhook = Container.get(StripeWebhook);
    this.SignalHireWebhook = Container.get(SignalHireWebhook);
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/stripe', this.StripeWebhook.Event);
    this.router.post('/signalHire', this.SignalHireWebhook.Event);
  }

  getRouter() {
    return this.router;
  }
}
