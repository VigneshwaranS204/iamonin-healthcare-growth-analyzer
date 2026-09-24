import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'iamonin-healthcare-growth-secret-key-2026-very-secure',
  crawl: {
    maxPages: parseInt(process.env.CRAWL_MAX_PAGES || '100', 10),
    maxDepth: parseInt(process.env.CRAWL_MAX_DEPTH || '4', 10),
    requestDelayMs: parseInt(process.env.CRAWL_REQUEST_DELAY_MS || '200', 10),
    timeoutMs: parseInt(process.env.CRAWL_TIMEOUT_MS || '15000', 10),
    maxResponseSizeBytes: 10 * 1024 * 1024, // 10MB
    userAgent: 'IAMONIN-Healthcare-Growth-Bot/1.0 (+https://iamonin.com/bot; healthcare audit bot)',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
