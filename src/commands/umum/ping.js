const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('../../config/messages');

module.exports = {
  adminOnly: false,
  data: new SlashCommandBuilder().setName('ping').setDescription('Cek status & kecepatan respons bot'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Menghitung...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    const embed = new EmbedBuilder()
      .setColor(COLORS.primary)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Latensi Pesan', value: `${latency}ms`, inline: true },
        { name: 'Latensi API', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
      )
      .setTimestamp();

    return interaction.editReply({ content: null, embeds: [embed] });
  },
};
