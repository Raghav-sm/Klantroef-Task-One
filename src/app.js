import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.route.js';
import mediaRoutes from './routes/media.route.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { requestLogger,errorLogger } from './middleware/logger.js';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// middlewares..
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// applying rate limiting..
app.use(generalLimiter);
app.use('/auth', authLimiter);

// serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// routes
app.use('/auth', authRoutes);
app.use('/media', mediaRoutes);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// error logging
app.use(errorLogger);

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export { app, connectDB };