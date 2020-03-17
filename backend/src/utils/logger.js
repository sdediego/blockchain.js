/**
 * Blockchain logger utility.
 *
 * @file Defines logger function for each file when called.
 */

import path from 'path';
import { createLogger, format, transports } from 'winston';
import logConfig from '../config/logger';

const { combine, colorize, label, printf, timestamp } = format;

/**
 * Creates and returns a logger function for the specified file.
 *
 * Should be called at the begging of the file we want to create
 * a logger to, providing the filename.
 *
 * @access public
 *
 * @function
 * @param  {String}   filename File to log.
 * @return {Function} Logger function.
 */
export const getLogger = filename => {
  const logger = createLogger({
    level: logConfig.level,
    format: combine(
      colorize(),
      label({ label: path.basename(filename) }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ label, level, message, timestamp }) => {
        return `${ timestamp } ${ level } [${ label }]: ${ message }`;
      })
    ),
    transports: [new transports.Console()],
    silent: process.env.NODE_ENV !== 'test' ? logConfig.silent : true
  });
  return logger;
};

export class Stream {
  constructor(logger) {
    this.logger = logger;
  }

  write(message) {
    this.logger.info(message);
  }
}

export default getLogger;
