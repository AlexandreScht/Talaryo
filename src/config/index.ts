import dotenv from 'dotenv';
dotenv.config();

const config = {
  origin: process.env.NEXTAUTH_URL,
  security: {
    stripe_key: process.env.STRIPE as string,
  },
  O2auth: {
    googleToken: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      secretClient: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  gaId: 'G-6W1NCQPH6C',
  hotjarId: 5074865,
  log: {
    FORMAT: process.env.LOG_FORMAT,
    DIR: process.env.LOG_DIR,
  },
  SERVER_URI: process.env.SERVER_URI as string,
  reCaptcha: process.env.CAPTCHA_TOKEN,
  cookie: process.env.COOKIE_NAME,
};
export default config;
