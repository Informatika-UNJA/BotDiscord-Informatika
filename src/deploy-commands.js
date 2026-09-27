const { REST, Routes } = require('discord.js');
const config = require('./config/config');
const { loadCommands } = require('./handlers/commandHandler');
const logger = require('./utils/logger');

config.assertRequiredEnv();

const forceGlobal = process.argv.includes('--global');
const commands = [...loadCommands().values()].map((cmd) => cmd.data.toJSON());
const rest = new REST().setToken(config.token);

(async () => {
  try {
    if (!forceGlobal && config.guildId) {
      logger.info(`Mendaftarkan ${commands.length} command ke guild ${config.guildId} (instan)...`);
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands });
      logger.success('Command berhasil didaftarkan ke guild.');
    } else {
      logger.info(`Mendaftarkan ${commands.length} command secara global (bisa memakan waktu ~1 jam untuk tampil)...`);
      await rest.put(Routes.applicationCommands(config.clientId), { body: commands });
      logger.success('Command berhasil didaftarkan secara global.');
    }
  } catch (err) {
    logger.error('Gagal mendaftarkan command:', err);
    process.exit(1);
  }
})();
