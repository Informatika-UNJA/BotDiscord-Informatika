const db = require('./db');

/* =========================================================
 *  STUDENTS REPOSITORY
 * ========================================================= */
const studentsRepo = {
  getByNim(nim) {
    return db.prepare('SELECT * FROM students WHERE nim = ?').get(nim);
  },

  add({ nim, nama_lengkap, angkatan, jabatan }) {
    return db
      .prepare(
        `INSERT INTO students (nim, nama_lengkap, angkatan, jabatan)
         VALUES (@nim, @nama_lengkap, @angkatan, @jabatan)
         ON CONFLICT(nim) DO UPDATE SET
           nama_lengkap = excluded.nama_lengkap,
           angkatan = excluded.angkatan,
           jabatan = excluded.jabatan`
      )
      .run({ nim, nama_lengkap, angkatan, jabatan: jabatan || null });
  },

  remove(nim) {
    return db.prepare('DELETE FROM students WHERE nim = ?').run(nim);
  },

  list({ angkatan = null, limit = 25, offset = 0 } = {}) {
    if (angkatan) {
      return db
        .prepare('SELECT * FROM students WHERE angkatan = ? ORDER BY nim ASC LIMIT ? OFFSET ?')
        .all(angkatan, limit, offset);
    }
    return db.prepare('SELECT * FROM students ORDER BY nim ASC LIMIT ? OFFSET ?').all(limit, offset);
  },

  count({ angkatan = null } = {}) {
    if (angkatan) {
      return db.prepare('SELECT COUNT(*) AS total FROM students WHERE angkatan = ?').get(angkatan).total;
    }
    return db.prepare('SELECT COUNT(*) AS total FROM students').get().total;
  },

  bulkUpsert(records) {
    const insert = db.prepare(
      `INSERT INTO students (nim, nama_lengkap, angkatan, jabatan)
       VALUES (@nim, @nama_lengkap, @angkatan, @jabatan)
       ON CONFLICT(nim) DO UPDATE SET
         nama_lengkap = excluded.nama_lengkap,
         angkatan = excluded.angkatan,
         jabatan = excluded.jabatan`
    );
    const runMany = db.transaction((rows) => {
      let count = 0;
      for (const row of rows) {
        insert.run(row);
        count += 1;
      }
      return count;
    });
    return runMany(records);
  },
};

/* =========================================================
 *  VERIFIED MEMBERS REPOSITORY
 * ========================================================= */
const verifiedRepo = {
  getByDiscordId(discordId) {
    return db
      .prepare(
        `SELECT vm.*, s.nama_lengkap, s.angkatan, s.jabatan
         FROM verified_members vm
         JOIN students s ON s.nim = vm.nim
         WHERE vm.discord_id = ?`
      )
      .get(discordId);
  },

  getByNim(nim) {
    return db.prepare('SELECT * FROM verified_members WHERE nim = ?').get(nim);
  },

  add({ discordId, nim, guildId }) {
    return db
      .prepare(
        `INSERT INTO verified_members (discord_id, nim, guild_id)
         VALUES (?, ?, ?)`
      )
      .run(discordId, nim, guildId);
  },
};

/* =========================================================
 *  ROLE MAPPING REPOSITORY  (angkatan/jabatan -> role Discord)
 * ========================================================= */
const roleMapRepo = {
  get(guildId, jenis, nilai) {
    return db
      .prepare('SELECT * FROM role_mappings WHERE guild_id = ? AND jenis = ? AND nilai = ?')
      .get(guildId, jenis, nilai.toString().toLowerCase());
  },

  set(guildId, jenis, nilai, roleId) {
    return db
      .prepare(
        `INSERT INTO role_mappings (guild_id, jenis, nilai, role_id)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(guild_id, jenis, nilai) DO UPDATE SET role_id = excluded.role_id`
      )
      .run(guildId, jenis, nilai.toString().toLowerCase(), roleId);
  },

  remove(guildId, jenis, nilai) {
    return db
      .prepare('DELETE FROM role_mappings WHERE guild_id = ? AND jenis = ? AND nilai = ?')
      .run(guildId, jenis, nilai.toString().toLowerCase());
  },

  list(guildId) {
    return db
      .prepare('SELECT * FROM role_mappings WHERE guild_id = ? ORDER BY jenis ASC, nilai ASC')
      .all(guildId);
  },
};

/* =========================================================
 *  GUILD SETTINGS REPOSITORY
 * ========================================================= */
const settingsRepo = {
  get(guildId) {
    return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
  },

  upsert(guildId, patch) {
    const existing = settingsRepo.get(guildId);
    if (!existing) {
      db.prepare(
        `INSERT INTO guild_settings (guild_id, welcome_channel_id, verify_channel_id, admin_role_id, verified_role_id)
         VALUES (@guild_id, @welcome_channel_id, @verify_channel_id, @admin_role_id, @verified_role_id)`
      ).run({
        guild_id: guildId,
        welcome_channel_id: patch.welcome_channel_id ?? null,
        verify_channel_id: patch.verify_channel_id ?? null,
        admin_role_id: patch.admin_role_id ?? null,
        verified_role_id: patch.verified_role_id ?? null,
      });
      return settingsRepo.get(guildId);
    }

    const merged = { ...existing, ...patch };
    db.prepare(
      `UPDATE guild_settings SET
         welcome_channel_id = @welcome_channel_id,
         verify_channel_id = @verify_channel_id,
         admin_role_id = @admin_role_id,
         verified_role_id = @verified_role_id
       WHERE guild_id = @guild_id`
    ).run(merged);
    return settingsRepo.get(guildId);
  },
};

/* =========================================================
 *  KOMTING SESSION REPOSITORY
 * ========================================================= */
const komtingRepo = {
  create({ guildId, categoryId, channelIds, createdBy, label }) {
    const info = db
      .prepare(
        `INSERT INTO komting_sessions (guild_id, category_id, channel_ids, created_by, label)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(guildId, categoryId, JSON.stringify(channelIds), createdBy, label);
    return info.lastInsertRowid;
  },

  listOpen(guildId) {
    return db
      .prepare(
        `SELECT * FROM komting_sessions WHERE guild_id = ? AND closed_at IS NULL ORDER BY created_at DESC`
      )
      .all(guildId)
      .map((row) => ({ ...row, channel_ids: JSON.parse(row.channel_ids) }));
  },

  getById(id) {
    const row = db.prepare('SELECT * FROM komting_sessions WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, channel_ids: JSON.parse(row.channel_ids) };
  },

  close(id) {
    return db
      .prepare(`UPDATE komting_sessions SET closed_at = datetime('now') WHERE id = ?`)
      .run(id);
  },
};

module.exports = {
  studentsRepo,
  verifiedRepo,
  roleMapRepo,
  settingsRepo,
  komtingRepo,
};
