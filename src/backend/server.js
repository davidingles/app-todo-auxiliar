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

app.get('/api/tasks', (req, res) => {
  res.json(getAllTasks());
});

app.post('/api/tasks', (req, res) => {
  const { title, description, status = 'pendiente' } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  const task = {
    id: randomUUID(),
    title: title.trim(),
    description: description?.trim() || '',
    status,
    position: Date.now(),
    updated_at: new Date().toISOString(),
  };

  createTask(task);
  res.status(201).json(task);
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
    updated_at: new Date().toISOString(),
  };

  updateTaskById(updates);
  res.json(updates);
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
