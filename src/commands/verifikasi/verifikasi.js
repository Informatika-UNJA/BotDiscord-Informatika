const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { buildVerifyPanelMessage } = require('../../handlers/verifyHandler');
const { settingsRepo } = require('../../database/repositories');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('verifikasi')
    .setDescription('Pengaturan sistem verifikasi anggota (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Memasang panel verifikasi di sebuah channel (misalnya #verify)')
        .addChannelOption((opt) =>
          opt
            .setName('channel')
            .setDescription('Channel tujuan panel verifikasi (default: channel saat ini)')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await interaction.deferReply({ ephemeral: true });

    const panel = buildVerifyPanelMessage();
    const sentMessage = await channel.send(panel);

    settingsRepo.upsert(interaction.guildId, { verify_channel_id: channel.id });

    await interaction.editReply(
      `✅ Panel verifikasi berhasil dipasang di ${channel} (ID pesan: \`${sentMessage.id}\`).`
    );
  },
};
