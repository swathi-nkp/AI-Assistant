import express from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuizScore,
  deleteQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getQuizzes);

router.post('/generate', createQuiz);

router.route('/:id')
  .get(getQuizById)
  .delete(deleteQuiz);

router.put('/:id/score', updateQuizScore);

export default router;
