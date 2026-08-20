const Database = require('better-sqlite3');
const path = require('path');

// tasks.db
const db1 = new Database(path.join(__dirname, 'data/tasks.db'));
const tables1 = db1.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\n=== tasks.db ===');
console.log('Tablas:', tables1.map(t => t.name));
const users1 = db1.prepare('SELECT COUNT(*) as c FROM users').get();
console.log('Users:', users1.c);
const tasks1 = db1.prepare('SELECT COUNT(*) as c FROM tasks').get();
console.log('Tasks total:', tasks1.c);
const tasksByUser1 = db1.prepare('SELECT user_id, COUNT(*) as c FROM tasks GROUP BY user_id').all();
console.log('Tasks por usuario:', tasksByUser1);
db1.close();

// database.db
const db2 = new Database(path.join(__dirname, 'data/database.db'));
const tables2 = db2.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('\n=== database.db ===');
console.log('Tablas:', tables2.map(t => t.name));
if (tables2.some(t => t.name === 'tasks')) {
  const tasks2 = db2.prepare('SELECT COUNT(*) as c FROM tasks').get();
  console.log('Tasks total:', tasks2.c);
  const tasksByUser2 = db2.prepare('SELECT user_id, COUNT(*) as c FROM tasks GROUP BY user_id').all();
  console.log('Tasks por usuario:', tasksByUser2);
} else {
  console.log('No existe tabla tasks');
}
db2.close();