import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import express from 'express';
import logger from 'morgan';

import router from './routes/index';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // return the error response
  return res.status(err.status || 500).json({
    status: {
      code: res.statusCode,
      msg: 'Error'
    },
    data: null
  });
});

export default app;
