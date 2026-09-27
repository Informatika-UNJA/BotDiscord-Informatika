const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../config/config');

const resolvedPath = path.resolve(process.cwd(), config.databasePath);
const dbDir = path.dirname(resolvedPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    nim           TEXT PRIMARY KEY,
    nama_lengkap  TEXT NOT NULL,
    angkatan      TEXT NOT NULL,
    jabatan       TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS verified_members (
    discord_id    TEXT PRIMARY KEY,
    nim           TEXT NOT NULL UNIQUE REFERENCES students(nim) ON DELETE CASCADE,
    guild_id      TEXT NOT NULL,
    verified_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS role_mappings (
    guild_id      TEXT NOT NULL,
    jenis         TEXT NOT NULL, -- 'angkatan' | 'jabatan'
    nilai         TEXT NOT NULL, -- '2024', 'Kabinet', dst
    role_id       TEXT NOT NULL,
    PRIMARY KEY (guild_id, jenis, nilai)
  );

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id            TEXT PRIMARY KEY,
    welcome_channel_id   TEXT,
    verify_channel_id    TEXT,
    admin_role_id        TEXT,
    verified_role_id     TEXT
  );

  CREATE TABLE IF NOT EXISTS komting_sessions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id      TEXT NOT NULL,
    category_id   TEXT,
    channel_ids   TEXT NOT NULL, -- JSON array of channel IDs
    created_by    TEXT NOT NULL,
    label         TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at     TEXT
  );
`);

module.exports = db;
