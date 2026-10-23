import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.put('/password', updateUserPassword);

export default router;
