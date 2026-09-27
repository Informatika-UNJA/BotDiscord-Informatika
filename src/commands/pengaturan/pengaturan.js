const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { settingsRepo } = require('../../database/repositories');
const { COLORS } = require('../../config/messages');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('pengaturan')
    .setDescription('Pengaturan umum bot (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub
        .setName('welcome-channel')
        .setDescription('Mengatur channel untuk pesan selamat datang & perpisahan anggota')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel tujuan').addChannelTypes(ChannelType.GuildText).setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('verified-role')
        .setDescription('Mengatur role dasar yang diberikan setelah verifikasi berhasil')
        .addRoleOption((o) => o.setName('role').setDescription('Role dasar terverifikasi').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('admin-role')
        .setDescription('Mengatur role "ADMIN IF" yang dipakai bot untuk otorisasi perintah admin')
        .addRoleOption((o) => o.setName('role').setDescription('Role ADMIN IF').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('lihat').setDescription('Menampilkan pengaturan saat ini')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'welcome-channel') {
      const channel = interaction.options.getChannel('channel');
      settingsRepo.upsert(interaction.guildId, { welcome_channel_id: channel.id });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.success)
            .setDescription(`✅ Pesan selamat datang & perpisahan sekarang akan dikirim ke ${channel}.`),
        ],
      });
    }

    if (sub === 'verified-role') {
      const role = interaction.options.getRole('role');
      settingsRepo.upsert(interaction.guildId, { verified_role_id: role.id });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.success)
            .setDescription(`✅ Role dasar terverifikasi sekarang: ${role}.`),
        ],
      });
    }

    if (sub === 'admin-role') {
      const role = interaction.options.getRole('role');
      settingsRepo.upsert(interaction.guildId, { admin_role_id: role.id });
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.success)
            .setDescription(`✅ Role ADMIN IF sekarang: ${role}.`),
        ],
      });
    }

    if (sub === 'lihat') {
      const settings = settingsRepo.get(interaction.guildId);
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.info)
            .setTitle('⚙️ Pengaturan Server Saat Ini')
            .addFields(
              {
                name: 'Channel Welcome/Leave',
                value: settings?.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : '_Belum diatur_',
              },
              {
                name: 'Channel Verifikasi',
                value: settings?.verify_channel_id ? `<#${settings.verify_channel_id}>` : '_Belum diatur_',
              },
              {
                name: 'Role Terverifikasi',
                value: settings?.verified_role_id ? `<@&${settings.verified_role_id}>` : '_Belum diatur_',
              },
              {
                name: 'Role ADMIN IF',
                value: settings?.admin_role_id ? `<@&${settings.admin_role_id}>` : '_Menggunakan fallback nama role "ADMIN IF"_',
              }
            ),
        ],
      });
    }
  },
};
