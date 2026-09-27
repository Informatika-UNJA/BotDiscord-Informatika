const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { VERIFY_MODAL, VERIFY_RESULT } = require('../config/messages');
const { isValidNamaFormat, isValidNimFormat, normalize } = require('../utils/validators');
const { studentsRepo, verifiedRepo, roleMapRepo, settingsRepo } = require('../database/repositories');
const {
  buildVerifyPanelEmbed,
  buildVerifyErrorEmbed,
  buildVerifyInfoEmbed,
  buildVerifySuccessEmbed,
} = require('../utils/embeds');
const config = require('../config/config');
const logger = require('../utils/logger');

const CUSTOM_ID = {
  BUTTON: 'verify:open',
  MODAL: 'verify:modal',
  FIELD_NAMA: 'verify:nama',
  FIELD_NIM: 'verify:nim',
};

function buildVerifyPanelMessage() {
  const button = new ButtonBuilder()
    .setCustomId(CUSTOM_ID.BUTTON)
    .setLabel('Verifikasi Sekarang')
    .setEmoji('✅')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(button);
  return { embeds: [buildVerifyPanelEmbed()], components: [row] };
}

function buildVerifyModal() {
  const modal = new ModalBuilder().setCustomId(CUSTOM_ID.MODAL).setTitle(VERIFY_MODAL.title);

  const namaInput = new TextInputBuilder()
    .setCustomId(CUSTOM_ID.FIELD_NAMA)
    .setLabel(VERIFY_MODAL.namaLabel)
    .setPlaceholder(VERIFY_MODAL.namaPlaceholder)
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(80)
    .setRequired(true);

  const nimInput = new TextInputBuilder()
    .setCustomId(CUSTOM_ID.FIELD_NIM)
    .setLabel(VERIFY_MODAL.nimLabel)
    .setPlaceholder(VERIFY_MODAL.nimPlaceholder)
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(20)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(namaInput),
    new ActionRowBuilder().addComponents(nimInput)
  );

  return modal;
}

async function handleVerifyButton(interaction) {
  await interaction.showModal(buildVerifyModal());
}

async function handleVerifyModalSubmit(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const namaRaw = interaction.fields.getTextInputValue(CUSTOM_ID.FIELD_NAMA);
  const nimRaw = interaction.fields.getTextInputValue(CUSTOM_ID.FIELD_NIM);
  const nama = normalize(namaRaw);
  const nim = normalize(nimRaw);

  // 1) Validasi format penulisan
  if (!isValidNamaFormat(nama) || !isValidNimFormat(nim)) {
    return interaction.editReply({
      embeds: [buildVerifyErrorEmbed(VERIFY_RESULT.invalidFormatTitle, VERIFY_RESULT.invalidFormatDesc)],
    });
  }

  // 2) Cek apakah akun Discord ini sudah pernah verifikasi
  const alreadyByDiscord = verifiedRepo.getByDiscordId(interaction.user.id);
  if (alreadyByDiscord) {
    return interaction.editReply({
      embeds: [
        buildVerifyInfoEmbed(
          VERIFY_RESULT.alreadyVerifiedSelfTitle,
          VERIFY_RESULT.alreadyVerifiedSelfDesc
            .replace('{nama}', alreadyByDiscord.nama_lengkap)
            .replace('{nim}', alreadyByDiscord.nim)
        ),
      ],
    });
  }

  // 3) Cari mahasiswa berdasarkan NIM
  const student = studentsRepo.getByNim(nim);
  if (!student) {
    return interaction.editReply({
      embeds: [buildVerifyErrorEmbed(VERIFY_RESULT.notFoundTitle, VERIFY_RESULT.notFoundDesc)],
    });
  }

  // 4) Cocokkan nama (case-insensitive, karena kapitalisasi sudah divalidasi di langkah 1)
  if (student.nama_lengkap.trim().toLowerCase() !== nama.toLowerCase()) {
    return interaction.editReply({
      embeds: [buildVerifyErrorEmbed(VERIFY_RESULT.mismatchTitle, VERIFY_RESULT.mismatchDesc)],
    });
  }

  // 5) Pastikan NIM belum diklaim akun Discord lain
  const usedBy = verifiedRepo.getByNim(nim);
  if (usedBy && usedBy.discord_id !== interaction.user.id) {
    return interaction.editReply({
      embeds: [buildVerifyErrorEmbed(VERIFY_RESULT.nimTakenTitle, VERIFY_RESULT.nimTakenDesc)],
    });
  }

  // 6) Susun daftar role yang perlu diberikan
  const settings = settingsRepo.get(interaction.guildId);
  const verifiedRoleId = settings?.verified_role_id || config.verifiedRoleId;

  const roleIdsToAssign = new Set();
  if (verifiedRoleId) roleIdsToAssign.add(verifiedRoleId);

  const angkatanMap = roleMapRepo.get(interaction.guildId, 'angkatan', student.angkatan);
  if (angkatanMap) roleIdsToAssign.add(angkatanMap.role_id);

  if (student.jabatan) {
    const jabatanMap = roleMapRepo.get(interaction.guildId, 'jabatan', student.jabatan);
    if (jabatanMap) roleIdsToAssign.add(jabatanMap.role_id);
  }

  const roleMentions = [];
  if (roleIdsToAssign.size > 0) {
    try {
      await interaction.member.roles.add([...roleIdsToAssign]);
      for (const id of roleIdsToAssign) {
        const role = interaction.guild.roles.cache.get(id);
        if (role) roleMentions.push(`<@&${id}>`);
      }
    } catch (err) {
      logger.warn('Gagal memberikan role verifikasi:', err.message);
    }
  }

  // 7) Simpan status verifikasi ke database
  verifiedRepo.add({ discordId: interaction.user.id, nim: student.nim, guildId: interaction.guildId });

  // 8) (Opsional, best-effort) set nickname sesuai nama akademik
  try {
    await interaction.member.setNickname(student.nama_lengkap);
  } catch (err) {
    // Bot mungkin tidak punya izin mengubah nickname pemilik/admin server — abaikan saja.
  }

  return interaction.editReply({
    embeds: [
      buildVerifySuccessEmbed({
        nama: student.nama_lengkap,
        nim: student.nim,
        angkatan: student.angkatan,
        jabatan: student.jabatan,
        roleMentions,
      }),
    ],
  });
}

module.exports = {
  CUSTOM_ID,
  buildVerifyPanelMessage,
  buildVerifyModal,
  handleVerifyButton,
  handleVerifyModalSubmit,
};
