import db from '../connection.js';

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