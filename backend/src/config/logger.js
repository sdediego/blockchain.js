/**
 * Blockchain logger configuration.
 *
 * @file Defines logger configuration for the application.
 */

import Joi from '@hapi/joi';
import config from './config.json';
import { LoggerError } from '../utils/errors';

const logSchema = Joi.object().keys({
  LOG_LEVEL: Joi.string().allow(...config.ALLOW_LOG_LEVELS).default(config.DEFAULT_LOG_LEVEL),
  LOG_SILENT: Joi.boolean().default(config.DEFAULT_LOG_SILENT)
}).unknown(true);

const { error, value } = logSchema.validate(process.env);
if (error) {
  const message = `Logger configuration error: ${ error.message }`;
  throw new LoggerError(message);
}

const logConfig = {
  level: value.LOG_LEVEL,
  silent: value.LOG_SILENT,
  filePath: value.LOG_FILEPATH
};

export default logConfig;
