import SignalHereWebhook from '@/webhooks/signalHire';
import StripeWebhook from '@/webhooks/stripe';
import { Router } from 'express';
import Container from 'typedi';

export class WebhookRouter {
  public router = Router();
  private StripeWebhook: StripeWebhook;
  private SignalHereWebhook: SignalHereWebhook;

  constructor() {
    this.StripeWebhook = Container.get(StripeWebhook);
    this.SignalHereWebhook = Container.get(SignalHereWebhook);
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/stripe', this.StripeWebhook.Event);
    this.router.post('/signalHere', this.SignalHereWebhook.Event);
  }

  getRouter() {
    return this.router;
  }
}
