const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { buildAnnouncementEmbed } = require('../../utils/embeds');
const { COLORS, ANNOUNCEMENT } = require('../../config/messages');

const TARGETABLE_CHANNEL_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

module.exports = {
  adminOnly: true, // Sengaja dibatasi ke ADMIN IF karena command ini bisa nge-tag @everyone
  data: new SlashCommandBuilder()
    .setName('pengumuman')
    .setDescription('Kirim pengumuman resmi atau polling ke sebuah channel (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((sub) =>
      sub
        .setName('kirim')
        .setDescription('Mengirim pesan pengumuman bergaya embed')
        .addStringOption((o) =>
          o.setName('judul').setDescription('Judul pengumuman').setRequired(true).setMinLength(1).setMaxLength(256)
        )
        .addStringOption((o) =>
          o
            .setName('pesan')
            .setDescription('Isi pesan pengumuman')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(1024)
        )
        .addChannelOption((o) =>
          o
            .setName('channel')
            .setDescription('Channel tujuan (default: channel ini)')
            .addChannelTypes(...TARGETABLE_CHANNEL_TYPES)
            .setRequired(false)
        )
        .addAttachmentOption((o) =>
          o.setName('gambar').setDescription('Gambar opsional untuk ditampilkan di pengumuman').setRequired(false)
        )
        .addBooleanOption((o) =>
          o
            .setName('tag_everyone')
            .setDescription('Tag @everyone? Default: false (tidak nge-tag siapa pun)')
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('polling')
        .setDescription('Membuat polling native Discord')
        .addStringOption((o) =>
          o.setName('pertanyaan').setDescription('Pertanyaan polling').setRequired(true).setMinLength(1).setMaxLength(300)
        )
        .addStringOption((o) => o.setName('opsi1').setDescription('Opsi jawaban 1').setRequired(true).setMaxLength(55))
        .addStringOption((o) => o.setName('opsi2').setDescription('Opsi jawaban 2').setRequired(true).setMaxLength(55))
        .addStringOption((o) => o.setName('opsi3').setDescription('Opsi jawaban 3 (opsional)').setRequired(false).setMaxLength(55))
        .addStringOption((o) => o.setName('opsi4').setDescription('Opsi jawaban 4 (opsional)').setRequired(false).setMaxLength(55))
        .addStringOption((o) => o.setName('opsi5').setDescription('Opsi jawaban 5 (opsional)').setRequired(false).setMaxLength(55))
        .addChannelOption((o) =>
          o
            .setName('channel')
            .setDescription('Channel tujuan (default: channel ini)')
            .addChannelTypes(...TARGETABLE_CHANNEL_TYPES)
            .setRequired(false)
        )
        .addIntegerOption((o) =>
          o
            .setName('durasi_jam')
            .setDescription('Durasi polling dalam jam (default: 24)')
            .setMinValue(1)
            .setMaxValue(720)
            .setRequired(false)
        )
        .addBooleanOption((o) =>
          o.setName('multi_pilih').setDescription('Boleh pilih lebih dari 1 jawaban? Default: false').setRequired(false)
        )
        .addBooleanOption((o) =>
          o
            .setName('tag_everyone')
            .setDescription('Tag @everyone? Default: false (tidak nge-tag siapa pun)')
            .setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'kirim') return handleKirim(interaction);
    if (sub === 'polling') return handlePolling(interaction);
  },
};

async function handleKirim(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const judul = interaction.options.getString('judul');
  const pesan = interaction.options.getString('pesan');
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const gambar = interaction.options.getAttachment('gambar');
  const tagEveryone = interaction.options.getBoolean('tag_everyone') ?? false;

  if (!channel.isTextBased()) {
    return interaction.editReply('❌ Channel yang dipilih bukan text channel.');
  }

  const embed = buildAnnouncementEmbed({
    judul,
    pesan,
    guild: interaction.guild,
    imageUrl: gambar?.url,
  });

  try {
    await channel.send({
      content: tagEveryone ? '@everyone' : undefined,
      embeds: [embed],
      allowedMentions: tagEveryone ? { parse: ['everyone'] } : { parse: [] },
    });
  } catch (err) {
    return interaction.editReply(`❌ Gagal mengirim pengumuman: ${err.message}`);
  }

  return interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`✅ Pengumuman berhasil dikirim ke ${channel}${tagEveryone ? ' (dengan tag @everyone)' : ''}.`),
    ],
  });
}

async function handlePolling(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const pertanyaan = interaction.options.getString('pertanyaan');
  const channel = interaction.options.getChannel('channel') || interaction.channel;
  const durasiJam = interaction.options.getInteger('durasi_jam') ?? 24;
  const multiPilih = interaction.options.getBoolean('multi_pilih') ?? false;
  const tagEveryone = interaction.options.getBoolean('tag_everyone') ?? false;

  const opsiList = [1, 2, 3, 4, 5]
    .map((n) => interaction.options.getString(`opsi${n}`))
    .filter((v) => Boolean(v && v.trim()));

  if (opsiList.length < 2) {
    return interaction.editReply('❌ Minimal 2 opsi jawaban dibutuhkan untuk membuat polling.');
  }

  if (!channel.isTextBased()) {
    return interaction.editReply('❌ Channel yang dipilih bukan text channel.');
  }

  const answers = opsiList.map((text, i) => ({
    text,
    emoji: ANNOUNCEMENT.pollDefaultEmojis[i],
  }));

  try {
    await channel.send({
      content: tagEveryone ? '@everyone' : undefined,
      allowedMentions: tagEveryone ? { parse: ['everyone'] } : { parse: [] },
      poll: {
        question: { text: pertanyaan },
        answers,
        duration: durasiJam,
        allowMultiselect: multiPilih,
      },
    });
  } catch (err) {
    return interaction.editReply(`❌ Gagal membuat polling: ${err.message}`);
  }

  return interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`✅ Polling berhasil dikirim ke ${channel}${tagEveryone ? ' (dengan tag @everyone)' : ''}.`),
    ],
  });
}
