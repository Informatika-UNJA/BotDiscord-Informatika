const { EmbedBuilder } = require('discord.js');
const config = require('../config/config');
const { COLORS } = require('../config/messages');
const { settingsRepo } = require('../database/repositories');

/**
 * Mengecek apakah seorang GuildMember memiliki role "ADMIN IF".
 * Prioritas pengecekan:
 *  1. admin_role_id yang diset lewat /pengaturan admin-role (per-server, tersimpan di DB)
 *  2. ADMIN_ROLE_ID dari .env
 *  3. Fallback: mencocokkan nama role persis "ADMIN IF" (case-insensitive)
 */
function isAdminIF(member) {
  if (!member) return false;

  const settings = settingsRepo.get(member.guild.id);
  const configuredId = settings?.admin_role_id || config.adminRoleId;

  if (configuredId && member.roles.cache.has(configuredId)) return true;

  return member.roles.cache.some(
    (role) => role.name.trim().toLowerCase() === config.adminRoleNameFallback.toLowerCase()
  );
}

function resolveAdminRole(guild) {
  const settings = settingsRepo.get(guild.id);
  const configuredId = settings?.admin_role_id || config.adminRoleId;
  if (configuredId) {
    const role = guild.roles.cache.get(configuredId);
    if (role) return role;
  }
  return (
    guild.roles.cache.find(
      (role) => role.name.trim().toLowerCase() === config.adminRoleNameFallback.toLowerCase()
    ) || null
  );
}

function noPermissionEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.danger)
    .setTitle('⛔ Akses Ditolak')
    .setDescription('Perintah ini hanya dapat digunakan oleh anggota dengan role **ADMIN IF**.')
    .setTimestamp();
}

module.exports = { isAdminIF, resolveAdminRole, noPermissionEmbed };
