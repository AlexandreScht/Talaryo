const { cleanEnv, str, port, bool } = require('envalid');

require('dotenv').config();

try {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'], default: 'development' }),
    PORT: port(),
    FRONT_URL: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_HOST: str(),
    DB_Port: port(),
    DB_DATABASE: str(),
    RECAPTCHA_SECRET_KEY: str(),
    JWT_SECRET: str(),
    SESSION_SECRET: str(),
    PASSWORD_PEPPER: str(),
    PROXY_SERVER: str(),
    PROXY_USERNAME: str(),
    PROXY_PASSWORD: str(),
    LOG_FORMAT: str({ choices: ['combined', 'dev'], default: 'dev' }),
    LOG_DIR: str({ default: '../logs' }),
    MAILER_DIR: str({ default: '../templates' }),
    MAILER_USER: str(),
    MAILER_PASSWORD: str(),
    MAILER_PORT: str(),
    MAILER_HOST: str(),
    ORIGIN: str(),
    CREDENTIALS: bool(),
    PROXYCURL_KEY: str(),
    STRIPE_SECRET_KEY: str(),
    STRIPE_SECRET_WEBHOOK: str(),
    LINKEDIN: str(),
  });
} catch (error: unknown) {
  process.exit(1);
}
