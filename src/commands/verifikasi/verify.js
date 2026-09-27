const { SlashCommandBuilder } = require('discord.js');
const { buildVerifyModal } = require('../../handlers/verifyHandler');

module.exports = {
  adminOnly: false,
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Buka formulir verifikasi identitas mahasiswa Informatika UNJA'),

  async execute(interaction) {
    await interaction.showModal(buildVerifyModal());
  },
};
