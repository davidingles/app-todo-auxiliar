import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import {
  getTasksByUser,
  createTask,
  updateTaskById,
  deleteTaskById,
  getTaskById,
} from '../../database/models/task.model.js';
import { sanitizeTags, serializeTask } from '../utils/sanitize.js';
import { uploadsDir } from '../services/upload.service.js';

function parseAttachments(task) {
  try {
    return JSON.parse(task.attachments || '[]');
  } catch {
    return [];
  }
}

export function listTasks(req, res) {
  res.json(getTasksByUser(req.user.id).map(serializeTask));
}

export function createTaskHandler(req, res) {
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
}

export function updateTaskHandler(req, res) {
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
}

export function deleteTaskHandler(req, res) {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
  }

  deleteTaskById(req.params.id);
  res.status(204).send();
}

export function addAttachment(req, res) {
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

  const attachments = parseAttachments(existing);
  attachments.push(attachment);

  updateTaskById({
    ...existing,
    attachments: JSON.stringify(attachments),
  });

  res.status(201).json(attachment);
}

export function removeAttachment(req, res) {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
  }

  const attachments = parseAttachments(existing);
  const index = attachments.findIndex((a) => a.id === req.params.attachmentId);
  if (index === -1) {
    return res.status(404).json({ error: 'Archivo adjunto no encontrado' });
  }

  const [removed] = attachments.splice(index, 1);

  const filePath = path.join(uploadsDir, removed.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  updateTaskById({
    ...existing,
    attachments: JSON.stringify(attachments),
  });

  res.status(204).send();
}

export function listAttachments(req, res) {
  const existing = getTaskById(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }
  if (existing.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta tarea' });
  }

  res.json(parseAttachments(existing));
}