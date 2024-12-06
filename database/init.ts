const Database = require('better-sqlite3');
const db = new Database('./database/trip-tracker.db');

// countries TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             abbreviation TEXT NOT NULL
    );
`);

// trips TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                         destination TEXT NOT NULL,
                                         startDate TEXT NOT NULL,
                                         endDate TEXT NOT NULL,
                                         notes TEXT,
                                         countryId INTEGER NOT NULL,
                                         FOREIGN KEY (countryId) REFERENCES countries (id) ON DELETE CASCADE
    );
`);

console.log('Database initialized');
