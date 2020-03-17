/**
 * Backend API.
 *
 * @file Defines blockchain application backend API setup.
 */

import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import express from 'express';
import morgan from 'morgan';
import router from './router';
import getLogger, { Stream } from '../utils/logger';

const logger = getLogger(__filename);
const stream = new Stream(logger);

const app = express();

app.use(morgan('dev', { stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API router
app.use('/', router);

// Catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// Error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Return the error response
  return res.status(err.status || 500).json({
    status: {
      code: res.statusCode,
      msg: 'Error'
    },
    data: null
  });
});

export default app;
