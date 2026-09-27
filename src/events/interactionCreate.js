const { Events, MessageFlags } = require('discord.js');
const { isAdminIF, noPermissionEmbed } = require('../utils/permissions');
const { CUSTOM_ID, handleVerifyButton, handleVerifyModalSubmit } = require('../handlers/verifyHandler');
const logger = require('../utils/logger');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        return handleChatInputCommand(interaction);
      }

      if (interaction.isButton() && interaction.customId === CUSTOM_ID.BUTTON) {
        return handleVerifyButton(interaction);
      }

      if (interaction.isModalSubmit() && interaction.customId === CUSTOM_ID.MODAL) {
        return handleVerifyModalSubmit(interaction);
      }
    } catch (err) {
      logger.error('Terjadi error saat memproses interaksi:', err);
      const payload = {
        content: '⚠️ Terjadi kesalahan tak terduga saat memproses permintaan kamu.',
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  },
};

async function handleChatInputCommand(interaction) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  if (command.adminOnly && !isAdminIF(interaction.member)) {
    return interaction.reply({ embeds: [noPermissionEmbed()], flags: MessageFlags.Ephemeral });
  }

  await command.execute(interaction);
}
