import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import {
  getAllTasks,
  createTask,
  updateTaskById,
  deleteTaskById,
  getTaskById,
} from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
  return {
    ...task,
    tags: sanitizeTags(task.tags),
  };
}

app.get('/api/tasks', (req, res) => {
  res.json(getAllTasks().map(serializeTask));
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
  };

  createTask(task);
  res.status(201).json(serializeTask(task));
});

app.put('/api/tasks/:id', (req, res) => {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const updates = {
    ...existing,
    ...req.body,
    id: req.params.id,
    tags: JSON.stringify(sanitizeTags(Object.hasOwn(req.body, 'tags') ? req.body.tags : existing.tags)),
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

  deleteTaskById(req.params.id);
  res.status(204).send();
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Servidor backend escuchando en http://127.0.0.1:${PORT}`);
});
