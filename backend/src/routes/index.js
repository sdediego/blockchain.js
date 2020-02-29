/**
 * Blockchain API.
 *
 * @file Defines blockchain backend API routes.
 */

import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  return res.status(200).json({
    status: {
      code: res.statusCode,
      msg: 'OK'
    },
    data: 'Express'
  });
});

export default router;
