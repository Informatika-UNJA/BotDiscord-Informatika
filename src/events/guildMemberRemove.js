const { Events } = require('discord.js');
const { settingsRepo } = require('../database/repositories');
const { buildLeaveEmbed } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {
    try {
      const settings = settingsRepo.get(member.guild.id);
      const channelId = settings?.welcome_channel_id;
      if (!channelId) return;

      const channel = member.guild.channels.cache.get(channelId);
      if (!channel) return;

      await channel.send({ embeds: [buildLeaveEmbed(member)] });
    } catch (err) {
      logger.warn('Gagal mengirim pesan leave:', err.message);
    }
  },
};
