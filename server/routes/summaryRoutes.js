import express from 'express';
import {
  getSummaries,
  getSummaryById,
  createSummary,
  deleteSummary,
} from '../controllers/summaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSummaries)
  .post(createSummary);

router.route('/:id')
  .get(getSummaryById)
  .delete(deleteSummary);

export default router;
