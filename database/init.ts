const Database = require('better-sqlite3');
const db = new Database('./database/trip-tracker.db');

// countries TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             abbreviation TEXT NOT NULL,
                                             lat REAL NOT NULL,
                                              lng REAL NOT NULL,
                                              slug TEXT NOT NULL,
                                             last_visited DATETIME
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

// states TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        abbr TEXT,
        last_visited DATETIME,
        country_id INTEGER NOT NULL,
        FOREIGN KEY (country_id) REFERENCES countries(id)
    );
`);

// cities TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
                                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                                          name TEXT NOT NULL,
                                          lat REAL NOT NULL,
                                          lng REAL NOT NULL,
                                          last_visited DATETIME,
                                          state_id INTEGER,
                                          country_id INTEGER NOT NULL,
                                          FOREIGN KEY (state_id) REFERENCES states(id),
        FOREIGN KEY (country_id) REFERENCES countries(id)
        );
`);

// attractions TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS attractions (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               name TEXT NOT NULL,
                                               lat REAL NOT NULL,
                                               lng REAL NOT NULL,
                                               country_id INTEGER NOT NULL,
                                               is_unesco BOOLEAN DEFAULT 0,
                                               is_national_park BOOLEAN DEFAULT 0,
                                                last_visited DATETIME,
                                               FOREIGN KEY (country_id) REFERENCES countries(id)
    );
`);

console.log('Database initialized');
