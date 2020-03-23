/**
 * Backend API controllers.
 *
 * @file Defines blockchain application backend API controllers.
 */

import Blockchain from '../blockchain/models/blockchain.model';
import getLogger from '../utils/logger';

const logger = getLogger(__filename);

const blockchain = new Blockchain();

export const getHome = (req, res, next) => {
  logger.info('[API] GET home.');

  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: 'Welcome to Blockchain'
  });
};

export const getBlockchain = (req, res, next) => {
  logger.info('[API] GET blockchain.');

  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: blockchain
  });
};

export const getMine = (req, res, next) => {
  logger.info('[API] GET mine. Mining block.');
  const data = ['data'];
  const block = blockchain.addBlock(data);
  const message = `Block mined: \n${ block }.`;
  logger.info(`[API] GET mine. ${ message }`);

  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: block
  });
};
