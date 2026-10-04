const config = require('../config/config');

/**
 * Mencari role "Netral" (role default sebelum verifikasi) di sebuah guild.
 * Prioritas:
 *  1. NETRAL_ROLE_ID dari .env
 *  2. Fallback: mencocokkan nama role persis "Netral" (case-insensitive)
 * Mengembalikan null jika role tidak ditemukan.
 */
function resolveNetralRole(guild) {
  if (config.netralRoleId) {
    const byId = guild.roles.cache.get(config.netralRoleId);
    if (byId) return byId;
  }
  const wanted = config.netralRoleNameFallback.toLowerCase();
  return guild.roles.cache.find((role) => role.name.trim().toLowerCase() === wanted) || null;
}

module.exports = { resolveNetralRole };
