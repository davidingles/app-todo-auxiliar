import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/tasks.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pendiente',
    position INTEGER,
    updated_at TEXT
  )
`);

export function getAllTasks() {
  return db.prepare('SELECT * FROM tasks ORDER BY position, updated_at').all();
}

export function createTask(task) {
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, status, position, updated_at)
    VALUES (@id, @title, @description, @status, @position, @updated_at)
  `);
  stmt.run(task);
  return task;
}

export function updateTaskById(task) {
  const stmt = db.prepare(`
    UPDATE tasks
    SET title = @title,
        description = @description,
        status = @status,
        position = @position,
        updated_at = @updated_at
    WHERE id = @id
  `);
  stmt.run(task);
}

export function deleteTaskById(id) {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
}

export function getTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}
