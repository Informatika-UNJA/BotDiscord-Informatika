const { Events } = require('discord.js');
const { settingsRepo } = require('../database/repositories');
const { buildWelcomeEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const settings = settingsRepo.get(member.guild.id);
      const channelId = settings?.welcome_channel_id;
      if (!channelId) return;

      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) return;

      await channel.send({ embeds: [buildWelcomeEmbed(member)] });
    } catch (err) {
      logger.warn('Gagal mengirim pesan welcome:', err.message);
    }
  },
};
