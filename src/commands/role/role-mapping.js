const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { roleMapRepo } = require('../../database/repositories');
const { COLORS } = require('../../config/messages');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('role-mapping')
    .setDescription('Menghubungkan angkatan/jabatan dengan role Discord (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('set')
        .setDescription('Menetapkan role untuk sebuah angkatan atau jabatan')
        .addStringOption((o) =>
          o
            .setName('jenis')
            .setDescription('Jenis mapping')
            .setRequired(true)
            .addChoices({ name: 'Angkatan', value: 'angkatan' }, { name: 'Jabatan', value: 'jabatan' })
        )
        .addStringOption((o) =>
          o.setName('nilai').setDescription('Contoh: 2024 (untuk angkatan) atau Kabinet (untuk jabatan)').setRequired(true)
        )
        .addRoleOption((o) => o.setName('role').setDescription('Role Discord yang diberikan').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('hapus')
        .setDescription('Menghapus sebuah mapping')
        .addStringOption((o) =>
          o
            .setName('jenis')
            .setDescription('Jenis mapping')
            .setRequired(true)
            .addChoices({ name: 'Angkatan', value: 'angkatan' }, { name: 'Jabatan', value: 'jabatan' })
        )
        .addStringOption((o) => o.setName('nilai').setDescription('Nilai yang ingin dihapus').setRequired(true))
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('Menampilkan seluruh mapping yang aktif')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const jenis = interaction.options.getString('jenis');
      const nilai = interaction.options.getString('nilai').trim();
      const role = interaction.options.getRole('role');

      roleMapRepo.set(interaction.guildId, jenis, nilai, role.id);

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.success)
            .setDescription(`✅ **${jenis}: ${nilai}** sekarang terhubung dengan role ${role}.`),
        ],
      });
    }

    if (sub === 'hapus') {
      const jenis = interaction.options.getString('jenis');
      const nilai = interaction.options.getString('nilai').trim();
      roleMapRepo.remove(interaction.guildId, jenis, nilai);

      return interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Mapping **${jenis}: ${nilai}** dihapus.`)],
      });
    }

    if (sub === 'list') {
      const rows = roleMapRepo.list(interaction.guildId);
      if (rows.length === 0) {
        return interaction.reply({
          ephemeral: true,
          embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('Belum ada mapping yang diatur.')],
        });
      }

      const lines = rows.map((r) => `**${r.jenis}: ${r.nilai}** → <@&${r.role_id}>`);

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.info)
            .setTitle('🔗 Daftar Role Mapping')
            .setDescription(lines.join('\n')),
        ],
      });
    }
  },
};
