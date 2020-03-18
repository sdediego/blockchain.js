/**
 * API router.
 *
 * @file Defines blockchain application backend API router.
 */

import express from 'express';
import Blockchain from '../blockchain/models/blockchain.model';
import getLogger from '../utils/logger';

const logger = getLogger(__filename);

const router = express.Router();
const blockchain = new Blockchain();

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

router.get('/blockchain', (req, res, next) => {
  logger.info('[API] GET blockchain.');

  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: blockchain
  });
});

export default router;
