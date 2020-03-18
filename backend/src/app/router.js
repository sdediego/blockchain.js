/**
 * API router.
 *
 * @file Defines blockchain application backend API router.
 */

import express from 'express';
import getLogger from '../utils/logger';

const logger = getLogger(__filename);

const router = express.Router();

router.get('/', (req, res, next) => {
  logger.info('[API] GET home.');

  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: 'Welcome to Blockchain'
  });
});

export default router;
