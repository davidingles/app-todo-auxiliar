import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import {
  getTasksByUser,
  createTask,
  updateTaskById,
  deleteTaskById,
  getTaskById,
} from './db.js';
import authRouter, { authenticateToken } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../data/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// ── Rutas de autenticación ──
app.use('/api/auth', authRouter);

// ── Middleware: todas las rutas de tareas requieren autenticación ──
app.use('/api/tasks', authenticateToken);

function sanitizeTags(tags) {
  let source = [];

  if (Array.isArray(tags)) {
    source = tags;
  } else if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      source = Array.isArray(parsed) ? parsed : tags.split(',');
    } catch {
      source = tags.split(',');
    }
  }

  const seen = new Set();
  return source
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function serializeTask(task) {
  let attachments = [];
  try {
    attachments = JSON.parse(task.attachments || '[]');
  } catch {
    attachments = [];
  }

  return {
    ...task,
    tags: sanitizeTags(task.tags),
    attachments,
  };
}

app.get('/api/tasks', (req, res) => {
  res.json(getTasksByUser(req.user.id).map(serializeTask));
});

app.post('/api/tasks', (req, res) => {
  const { title, description, tags = [], status = 'pendiente' } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  const cleanTags = sanitizeTags(tags);
  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description?.trim() || '',
    tags: JSON.stringify(cleanTags),
    status,
    position: Date.now(),
    updated_at: new Date().toISOString(),
    user_id: req.user.id,
  };

  createTask(task);
  res.status(201).json(serializeTask(task));
});

app.put('/api/tasks/:id', (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
  }

  const updates = {
    ...existing,
    ...req.body,
    id: req.params.id,
    tags: JSON.stringify(sanitizeTags(Object.hasOwn(req.body, 'tags') ? req.body.tags : existing.tags)),
    attachments: existing.attachments,
    updated_at: new Date().toISOString(),
  };

  updateTaskById(updates);
  res.json(serializeTask(updates));
});

app.delete('/api/tasks/:id', (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
  }

  deleteTaskById(req.params.id);
  res.status(204).send();
});

app.post('/api/tasks/:id/attachments', upload.single('file'), (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo' });
  }

  const attachment = {
    id: randomUUID(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimeType: req.file.mimetype,
    uploadedAt: new Date().toISOString(),
  };

  let attachments = [];
  try {
    attachments = JSON.parse(existing.attachments || '[]');
  } catch {
    attachments = [];
  }
  attachments.push(attachment);

  updateTaskById({
    ...existing,
    attachments: JSON.stringify(attachments),
  });

  res.status(201).json(attachment);
});

app.delete('/api/tasks/:id/attachments/:attachmentId', (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
  }

  let attachments = [];
  try {
    attachments = JSON.parse(existing.attachments || '[]');
  } catch {
    attachments = [];
  }

  const index = attachments.findIndex((a) => a.id === req.params.attachmentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Archivo adjunto no encontrado' });
  }

  const [removed] = attachments.splice(index, 1);

  // Delete file from disk
  const filePath = path.join(uploadsDir, removed.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  updateTaskById({
    ...existing,
    attachments: JSON.stringify(attachments),
  });

  res.status(204).send();
});

app.get('/api/tasks/:id/attachments', (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta tarea' });
  }

  let attachments = [];
  try {
    attachments = JSON.parse(existing.attachments || '[]');
  } catch {
    attachments = [];
  }

  res.json(attachments);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor backend escuchando en http://127.0.0.1:${PORT}`);
});
