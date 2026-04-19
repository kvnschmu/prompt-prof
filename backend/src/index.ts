import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import promptRoutes from './routes/prompts';
import aiRoutes from './routes/ai';
import historyRoutes from './routes/history';
import settingsRoutes from './routes/settings';

// In Docker: Env-Variablen kommen aus docker-compose environment: — kein dotenv nötig
// In lokalem Dev ohne Docker: Lade .env aus Projekt-Root
if (process.env.NODE_ENV !== 'production') {
  // __dirname bei tsx watch = /home/kevin/promptmaker/backend/src
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-ai-provider', 'x-ai-api-key', 'x-ai-model', 'Cache-Control'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static Uploads — Pfad aus UPLOAD_DIR Env-Variable
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/prompts', promptRoutes);
app.use('/api', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

// Health check — wird von Docker healthcheck verwendet
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 0.0.0.0 statt localhost → erreichbar aus Docker-Netzwerk
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Prompt Professor API running on port ${PORT}`);
  console.log(`📁 Uploads: ${uploadsDir}`);
  console.log(`🗄️  Database: ${process.env.DATABASE_URL}`);
});

export default app;
