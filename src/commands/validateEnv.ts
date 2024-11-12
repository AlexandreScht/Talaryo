/* eslint-disable @typescript-eslint/no-var-requires */
// validateEnv.js
const { cleanEnv, str, port } = require('envalid');
require('dotenv').config();

try {
  if (process.version !== 'v20.14.0') {
    console.error('NVM version incorrect. Version 20.14.0 requise !');
    process.exit(1);
  }

  cleanEnv(process.env, {
    NODE_ENV: str({
      choices: ['development', 'production'],
      default: 'development',
    }),
    PORT: port({ default: 3000 }),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    CAPTCHA_TOKEN: str(),
    NEXTAUTH_URL: str(),
    NEXTAUTH_SECRET: str(),
    COOKIE_NAME: str(),
    JWT_SECRET: str(),
    SERVER_URI: str(),
    STRIPE: str(),
  });
} catch (error) {
  process.exit(1);
}
