import db from '../connection.js';

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