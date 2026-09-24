import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './routes/api.js';
import { errorHandler } from './middleware/error.js';
import { config } from './config/env.js';

export const app = express();

// Ensure reports directory exists
const reportsDir = path.resolve(process.cwd(), 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Security & Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // allow flexible PDF previews and local dev
  })
);
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'IAMONIN Healthcare Growth Analyzer',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Serve frontend build if exists in common deployment directory layouts
const possibleDistPaths = [
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'dist/frontend'),
  path.resolve(process.cwd(), 'dist'),
];
const frontendDistPath = possibleDistPaths.find((p) => fs.existsSync(path.join(p, 'index.html')));

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'IAMONIN Healthcare Growth Analyzer',
      message: 'Backend is running. API endpoints available at /api',
    });
  });
}

// Global Error Handler
app.use(errorHandler);
