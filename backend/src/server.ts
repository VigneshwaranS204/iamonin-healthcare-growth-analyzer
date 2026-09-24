import { app } from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(
    `🏥 IAMONIN Healthcare Growth Analyzer backend listening on http://0.0.0.0:${config.port}`
  );
  logger.info(`Mode: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
