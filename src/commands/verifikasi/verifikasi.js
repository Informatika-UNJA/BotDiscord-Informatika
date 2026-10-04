const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { buildVerifyPanelMessage } = require('../../handlers/verifyHandler');
const { settingsRepo, verifiedRepo, roleMapRepo } = require('../../database/repositories');
const { COLORS } = require('../../config/messages');
const config = require('../../config/config');

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
    )
    .addSubcommand((sub) =>
      sub
        .setName('hapus')
        .setDescription('Melepas status verifikasi seorang anggota (data mahasiswa TIDAK ikut terhapus)')
        .addUserOption((o) =>
          o.setName('user').setDescription('Anggota Discord yang ingin dilepas verifikasinya').setRequired(false)
        )
        .addStringOption((o) =>
          o.setName('nim').setDescription('Atau cari berdasarkan NIM yang terverifikasi').setRequired(false)
        )
        .addBooleanOption((o) =>
          o
            .setName('cabut_role')
            .setDescription('Cabut juga role yang sebelumnya diberikan? Default: true')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'setup') return handleSetup(interaction);
    if (sub === 'hapus') return handleHapus(interaction);
  },
};

async function handleSetup(interaction) {
  const channel = interaction.options.getChannel('channel') || interaction.channel;

  await interaction.deferReply({ ephemeral: true });

  const panel = buildVerifyPanelMessage();
  const sentMessage = await channel.send(panel);

  settingsRepo.upsert(interaction.guildId, { verify_channel_id: channel.id });

  await interaction.editReply(
    `✅ Panel verifikasi berhasil dipasang di ${channel} (ID pesan: \`${sentMessage.id}\`).`
  );
}

async function handleHapus(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userOpt = interaction.options.getUser('user');
  const nimOpt = interaction.options.getString('nim')?.trim();
  const cabutRole = interaction.options.getBoolean('cabut_role') ?? true;

  if (!userOpt && !nimOpt) {
    return interaction.editReply('❌ Isi salah satu opsi: `user` (mention Discord) atau `nim`.');
  }

  const verified = userOpt ? verifiedRepo.getByDiscordId(userOpt.id) : verifiedRepo.getByNim(nimOpt);

  if (!verified) {
    return interaction.editReply('❌ Tidak ditemukan data verifikasi yang cocok dengan itu.');
  }

  // Best-effort cabut role dulu selama membernya masih ada di server, sebelum record dihapus
  let roleNote = '';
  if (cabutRole) {
    try {
      const member = await interaction.guild.members.fetch(verified.discord_id);
      const rolesToRemove = new Set();

      const settings = settingsRepo.get(interaction.guildId);
      const verifiedRoleId = settings?.verified_role_id || config.verifiedRoleId;
      if (verifiedRoleId) rolesToRemove.add(verifiedRoleId);

      const angkatanMap = roleMapRepo.get(interaction.guildId, 'angkatan', verified.angkatan);
      if (angkatanMap) rolesToRemove.add(angkatanMap.role_id);

      if (verified.jabatan) {
        const jabatanMap = roleMapRepo.get(interaction.guildId, 'jabatan', verified.jabatan);
        if (jabatanMap) rolesToRemove.add(jabatanMap.role_id);
      }

      if (rolesToRemove.size > 0) {
        await member.roles.remove([...rolesToRemove]);
      }
      roleNote = ' Role terkait juga sudah dicabut.';
    } catch (err) {
      roleNote = ' (Anggotanya sudah tidak ada di server / gagal cabut role otomatis, tapi data verifikasi tetap dihapus.)';
    }
  }

  verifiedRepo.removeByDiscordId(verified.discord_id);

  return interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('🗑️ Verifikasi Dilepas')
        .setDescription(
          `Status verifikasi **${verified.nama_lengkap}** (\`${verified.nim}\`) — <@${verified.discord_id}> berhasil dihapus dari sistem.${roleNote}\n\n` +
            'Data mahasiswa di database **tidak ikut terhapus**, jadi yang bersangkutan masih bisa melakukan verifikasi ulang kapan saja (termasuk dari akun Discord lain).'
        ),
    ],
  });
}
