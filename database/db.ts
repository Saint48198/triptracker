const Database = require('better-sqlite3');
const db = new Database('./database/app.db');

module.exports = db;
