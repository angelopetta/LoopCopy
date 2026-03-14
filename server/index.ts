import express from 'express';
import aiRoutes from './routes/ai.js';

export function createServer() {
  const app = express();
  app.use(express.json());
  app.use('/api', aiRoutes);
  return app;
}
