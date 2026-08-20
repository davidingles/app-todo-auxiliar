import db from '../connection.js';

export function initDatabase() {
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
    db.exec('ALTER TABLE tasks ADD COLUMN user_id TEXT');
  }
}