const { cleanEnv, str, port } = require('envalid');

require('dotenv').config();

try {
  if (process.version !== 'v20.14.0') {
    console.error('NVM version incorrect. Version 20.14.0 requise !');
    process.exit(1);
  }
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'production'] }),
    PORT: port(),
    LOG_FORMAT: str({ choices: ['combined', 'dev'] }),
    LOG_DIR: str({ default: '../logs' }),
    SESSION_SECRET: str(),
    JWT_SECRET: str(),
    COOKIE_SECRET: str(),
    COOKIE_NAME: str(),
    TWO_FACTOR_AUTHENTICATOR: str(),
    ORIGIN: str(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_HOST: str(),
    ALLOWED_IP: str(),
    GOOGLE_CLIENT_ID: str(),
    DB_Port: port(),
    DB_DATABASE: str(),
    REDIS_PORT: port(),
    REDIS_PASSWORD: str(),
    MAILER_DIR: str({ default: '../templates' }),
    MAILER_USER: str(),
    MAILER_PASSWORD: str(),
    MAILER_PORT: str(),
    MAILER_HOST: str(),
  });
} catch (error: unknown) {
  process.exit(1);
}
