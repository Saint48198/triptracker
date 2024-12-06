const Database = require('better-sqlite3');
const db = new Database('./database/trip-tracker.db');

// Example Table
db.exec(`
  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
      abbreviation TEXT NOT NULL,
  );
`);

console.log('Database initialized');
