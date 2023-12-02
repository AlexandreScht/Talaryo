import config from '@config';
import chalk from 'chalk'; // Importez chalk pour la coloration de la console
import { existsSync, mkdirSync } from 'fs';
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

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
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
    }),
    // Console parts
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
  ],
});

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
