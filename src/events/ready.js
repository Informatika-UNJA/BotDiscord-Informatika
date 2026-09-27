const { Events, ActivityType } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.success(`Bot online sebagai ${client.user.tag}`);
    client.user.setPresence({
      activities: [{ name: 'Informatika UNJA | Since 2023', type: ActivityType.Watching }],
      status: 'online',
    });
  },
};
