/**
 * Backend API router.
 *
 * @file Defines blockchain application backend API router.
 */

import express from 'express';
import { getBlockchain, getHome, getMine } from './controllers';

const router = express.Router();

router.get('/', getHome);
router.get('/blockchain', getBlockchain);
router.get('/mine', getMine);

export default router;
