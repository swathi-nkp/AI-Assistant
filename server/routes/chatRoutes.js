import express from 'express';
import {
  getChats,
  getChatById,
  createChat,
  addMessage,
  deleteChat,
} from '../controllers/chatController.js';
import { getAIMode } from '../services/aiService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public mode query endpoint: returns 'offline' or 'openai'
router.get('/mode', (req, res) => {
  res.json({ success: true, mode: getAIMode() });
});

router.use(protect); // All conversation routes require authentication

router.route('/')
  .get(getChats)
  .post(createChat);

router.route('/:id')
  .get(getChatById)
  .delete(deleteChat);

router.post('/:id/messages', addMessage);

export default router;
