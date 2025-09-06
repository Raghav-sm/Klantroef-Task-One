import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import {
  uploadMedia,
  generateStreamUrl,
  streamMedia,
  getMediaAnalytics
} from '../controllers/media.controller.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, upload.single('media'), uploadMedia);
router.get('/:id/stream-url', authenticateToken, generateStreamUrl);
router.get('/:id/analytics', authenticateToken, getMediaAnalytics);

router.get('/stream/:id', streamMedia);

export default router;