const Database = require('better-sqlite3');
const db = new Database('./database/trip-tracker.db', { verbose: console.log });

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');

// countries TABLE
db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             alt_name TEXT,
                                             abbreviation TEXT NOT NULL,
                                             lat REAL NOT NULL,
                                             lng REAL NOT NULL,
                                             slug TEXT NOT NULL,
                                             last_visited DATETIME,
                                             geo_map_id TEXT NOT NULL UNIQUE
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
                                          geo_map_id TEXT,
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
                                          wiki_term TEXT,
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
        wiki_term TEXT,
        last_visited DATETIME,
        FOREIGN KEY (country_id) REFERENCES countries(id)
    );
`);

// Trigger: Update `countries.last_visited` based on `attractions.last_visited`
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_country_last_visited_from_attraction
  AFTER INSERT ON attractions
  BEGIN
    UPDATE countries
    SET last_visited = (
      SELECT MAX(last_visited)
      FROM attractions
      WHERE country_id = NEW.country_id
    )
    WHERE id = NEW.country_id;
  END;
`);

// Trigger: Update `countries.last_visited` based on `cities.last_visited`
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_country_last_visited_from_city
  AFTER INSERT ON cities
  BEGIN
    UPDATE countries
    SET last_visited = (
      SELECT MAX(last_visited)
      FROM cities
      WHERE country_id = NEW.country_id
    )
    WHERE id = NEW.country_id;
  END;
`);

// Trigger: Update `countries.last_visited` from `states.last_visited`
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_country_last_visited_from_state
  AFTER UPDATE OF last_visited ON states
  BEGIN
    UPDATE countries
    SET last_visited = (
      SELECT MAX(last_visited)
      FROM (
        SELECT last_visited FROM states WHERE country_id = NEW.country_id
        UNION ALL
        SELECT last_visited FROM cities WHERE country_id = NEW.country_id
      )
    )
    WHERE id = NEW.country_id;
  END;
`);

// Trigger: Update `states.last_visited` from `cities.last_visited`
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_state_last_visited_from_city
  AFTER UPDATE OF last_visited ON cities
  WHEN NEW.state_id IS NOT NULL
  BEGIN
    UPDATE states
    SET last_visited = (
      SELECT MAX(last_visited)
      FROM cities
      WHERE state_id = NEW.state_id
    )
    WHERE id = NEW.state_id;
  END;
`);

console.log('Database initialized');
