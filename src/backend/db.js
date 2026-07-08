import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/tasks.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT,
    google_id TEXT UNIQUE,
    avatar TEXT,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT DEFAULT '[]',
    status TEXT DEFAULT 'pendiente',
    position INTEGER,
    updated_at TEXT,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

const taskColumns = db.prepare('PRAGMA table_info(tasks)').all().map((column) => column.name);
if (!taskColumns.includes('tags')) {
  db.exec("ALTER TABLE tasks ADD COLUMN tags TEXT DEFAULT '[]'");
}
if (!taskColumns.includes('attachments')) {
  db.exec("ALTER TABLE tasks ADD COLUMN attachments TEXT DEFAULT '[]'");
}
if (!taskColumns.includes('user_id')) {
  db.exec("ALTER TABLE tasks ADD COLUMN user_id TEXT");
}

// ── Usuarios ──

export function getUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function getUserByGoogleId(googleId) {
  return db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser(user) {
  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password, google_id, avatar, created_at)
    VALUES (@id, @email, @name, @password, @google_id, @avatar, @created_at)
  `);
  stmt.run(user);
  return user;
}

export function updateUserById(id, fields) {
  const existing = getUserById(id);
  if (!existing) return null;
  const updated = { ...existing, ...fields };
  const stmt = db.prepare(`
    UPDATE users
    SET email = @email,
        name = @name,
        password = @password,
        google_id = @google_id,
        avatar = @avatar
    WHERE id = @id
  `);
  stmt.run(updated);
  return updated;
}

// ── Tareas ──

export function getTasksByUser(userId) {
  return db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY position, updated_at').all(userId);
}

export function createTask(task) {
  const stmt = db.prepare(`
    INSERT INTO tasks (id, title, description, tags, status, position, updated_at, user_id)
    VALUES (@id, @title, @description, @tags, @status, @position, @updated_at, @user_id)
  `);
  stmt.run(task);
  return task;
}

export function updateTaskById(task) {
  const stmt = db.prepare(`
    UPDATE tasks
    SET title = @title,
        description = @description,
        tags = @tags,
        attachments = @attachments,
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
