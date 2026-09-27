require('dotenv').config();

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null,

  // Role "ADMIN IF" — kalau ID kosong, sistem fallback mencocokkan berdasarkan nama role.
  adminRoleId: process.env.ADMIN_ROLE_ID || null,
  adminRoleNameFallback: 'ADMIN IF',

  verifiedRoleId: process.env.VERIFIED_ROLE_ID || null,

  databasePath: process.env.DATABASE_PATH || './data/bot.sqlite',
};

function assertRequiredEnv() {
  const missing = [];
  if (!config.token) missing.push('DISCORD_TOKEN');
  if (!config.clientId) missing.push('CLIENT_ID');

  if (missing.length > 0) {
    throw new Error(
      `Environment variable berikut belum diisi di file .env: ${missing.join(', ')}`
    );
  }
}

module.exports = { ...config, assertRequiredEnv };
