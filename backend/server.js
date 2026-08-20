import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { config } from './config/index.js';
import { initDatabase } from '../database/migrations/init.js';
import authRouter from './routes/auth.routes.js';
import tasksRouter from './routes/tasks.routes.js';
import { authenticateToken } from './middleware/auth.middleware.js';
import { uploadsDir } from './services/upload.service.js';

initDatabase();

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use(express.static(config.paths.frontend));
app.use(express.static(config.paths.public));

app.use('/api/auth', authRouter);
app.use('/api/tasks', authenticateToken, tasksRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(config.paths.frontend, 'index.html'));
});

app.listen(config.port, config.host, () => {
  console.log(`Servidor escuchando en http://${config.host}:${config.port}`);
});