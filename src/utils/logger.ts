import config from '@config';
import chalk from 'chalk'; // Importez chalk pour la coloration de la console
import { existsSync, mkdirSync } from 'fs';
import moment from 'moment-timezone';
import { join } from 'path';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const { log } = config;
// logs dir
const logDir: string = join(__dirname, log.DIR);

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

// Custom filter for log levels
const filterOnly = level => {
  return winston.format(info => {
    return info.level === level ? info : false;
  })();
};

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => moment().tz('Europe/Paris').format('YYYY-MM-DD HH:mm:ss'), // Change 'Europe/Paris' to your timezone
    }),
    logFormat,
  ),
  transports: [
    // debug log setting
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug', // dir log file -> /logs/debug/*.log
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      json: false,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: 'warn',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/warn', // dir log file -> /logs/warn/*.log
      filename: `%DATE%.log`,
      maxFiles: 90, // 90 Days saved
      json: false,
      zippedArchive: true,
      format: winston.format.combine(filterOnly('warn')),
    }),
    // error log setting
    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error', // dir log file -> /logs/error/*.log
      filename: `%DATE%.log`,
      maxFiles: 30, // 30 Days saved
      handleExceptions: true,
      json: false,
      zippedArchive: true,
      format: winston.format.combine(filterOnly('error')),
    }),
  ],
});

// Ajouter cette condition autour du transport Console
if (process.env.NODE_ENV !== 'test') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format(info => {
          info[Symbol.for('message')] = `${chalk[info.level === 'sql' ? 'blueBright' : 'yellow']('-'.repeat(process.stdout.columns))} [${chalk[
            info.level === 'sql' ? 'whiteBright' : 'red'
          ](info.level)}] ${chalk[info.level === 'sql' ? 'cyanBright' : 'blueBright'](info.message)}`;

          return info;
        })(),
      ),
    }),
  );
}

const stream = {
  write: (message: string) => {
    if (!/POST \/api\/stripe_webhook/.test(message)) {
      logger.info(message.substring(0, message.lastIndexOf('\n')));
    }
  },
};

export { logger, stream };
