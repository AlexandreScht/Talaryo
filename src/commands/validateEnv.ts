const { cleanEnv, str, port } = require('envalid');

require('dotenv').config();

try {
  if (process.version !== 'v20.14.0') {
    console.error('NVM version incorrect. Version 20.14.0 requise !');
    process.exit(1);
  }
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
    PORT: port(),
    LOG_FORMAT: str({ choices: ['combined', 'dev'] }),
    LOG_DIR: str({ default: '../logs' }),
    SESSION_SECRET: str(),
    JWT_SECRET: str(),
    COOKIE_SECRET: str(),
    COOKIE_NAME: str(),
    TWO_FACTOR_AUTHENTICATOR: str(),
    ORIGIN: str(),
    MONGO_DB_USER: str(),
    PG_DB_USER: str(),
    MONGO_DB_PASSWORD: str(),
    PG_DB_PASSWORD: str(),
    MONGO_DB_HOST: str(),
    PG_DB_HOST: str(),
    ALLOWED_IP: str(),
    GOOGLE_CLIENT_ID: str(),
    MONGO_DB_Port: port(),
    PG_DB_Port: port(),
    MONGO_DB_DATABASE: str(),
    PG_DB_DATABASE: str(),
    REDIS_PORT: port(),
    REDIS_PASSWORD: str(),
    MAILER_DIR: str({ default: '../templates' }),
    MAILER_USER: str(),
    MAILER_PASSWORD: str(),
    MAILER_PORT: str(),
    MAILER_HOST: str(),
    EXECUTABLE_PATH: str(),
    RECAPTCHA_SECRET_KEY: str(),
    EMAIL_KEY: str(),
    GPT_KEY: str(),
    IP: str(),
    PROXY_SERVER: str(),
    PROXY_USERNAME: str(),
    PROXY_PASSWORD: str(),
    PROXY_V2_SERVER: str(),
    PROXY_V2_USERNAME: str(),
    PROXY_V2_PASSWORD: str(),
    BREVOKEY: str(),
    STRIPE_SECRET_KEY: str(),
    STRIPE_SECRET_WEBHOOK: str(),
    LINKEDIN: str(),
    VIADEO: str(),
    XING: str(),
    BATIACTU: str(),
    DRIBBLE: str(),
    BEHANCE: str(),
    CULINARY_AGENTS: str(),
    SYMFONY: str(),
    HEC: str(),
    POLYTECHNIQUE: str(),
    FERRANDI: str(),
    UTC: str(),
    CENTRALE_SUPELEC: str(),
    CENTRALE_LILLE: str(),
    ESSEC: str(),
    NEOMA: str(),
  });
} catch (error: unknown) {
  process.exit(1);
}
