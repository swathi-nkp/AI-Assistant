import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Ensure server/.env is loaded reliably regardless of working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Connect to MongoDB
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*', // Allow frontend client requests
  credentials: true,
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Study Assistant Backend API is running successfully',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/users', userRoutes);

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Study Assistant Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
