const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  OverwriteType,
  EmbedBuilder,
} = require('discord.js');
const { komtingRepo } = require('../../database/repositories');
const { resolveAdminRole } = require('../../utils/permissions');
const {
  buildKomtingSuccessEmbed,
  buildKomtingCloseEmbed,
  buildKomtingNoSessionEmbed,
} = require('../../utils/embeds');
const { COLORS, KOMTING } = require('../../config/messages');

const MENTION_REGEX = /<@!?(\d+)>/g;

function extractUserIds(text) {
  if (!text) return [];
  const ids = new Set();
  let match;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    ids.add(match[1]);
  }
  // Juga dukung ID mentah dipisah spasi/koma
  text
    .replace(MENTION_REGEX, '')
    .split(/[\s,]+/)
    .filter((token) => /^\d{15,25}$/.test(token))
    .forEach((id) => ids.add(id));
  return [...ids];
}

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('komting')
    .setDescription('Kelola voice channel pemilihan komting (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand((sub) =>
      sub
        .setName('setup')
        .setDescription('Membuat voice channel khusus pemilihan komting')
        .addIntegerOption((o) =>
          o
            .setName('jumlah')
            .setDescription('Berapa banyak voice channel yang dibutuhkan')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)
        )
        .addRoleOption((o) =>
          o
            .setName('akses')
            .setDescription('Role yang boleh melihat & bergabung ke channel (contoh: role Angkatan 2024)')
            .setRequired(true)
        )
        .addStringOption((o) =>
          o.setName('label').setDescription('Nama sesi, contoh: "Pemilihan Komting 2024"').setRequired(false)
        )
        .addStringOption((o) =>
          o
            .setName('tambahan')
            .setDescription('Mention/ID anggota tambahan yang juga diberi akses (panitia, dsb), pisahkan spasi')
            .setRequired(false)
        )
        .addBooleanOption((o) =>
          o
            .setName('terlihat')
            .setDescription('Tetap terlihat publik tapi hanya yang diberi akses bisa join. Default: false')
            .setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('tutup')
        .setDescription('Menghapus voice channel & kategori sebuah sesi pemilihan komting')
        .addIntegerOption((o) =>
          o.setName('sesi_id').setDescription('ID sesi (lihat dengan /komting list). Kosongkan untuk sesi terbaru').setRequired(false)
        )
    )
    .addSubcommand((sub) => sub.setName('list').setDescription('Menampilkan sesi pemilihan komting yang masih aktif')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'setup') return handleSetup(interaction);
    if (sub === 'tutup') return handleTutup(interaction);
    if (sub === 'list') return handleList(interaction);
  },
};

async function handleSetup(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const botMember = interaction.guild.members.me;
  if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
    return interaction.editReply('❌ Bot tidak memiliki izin **Manage Channels** di server ini.');
  }

  const jumlah = interaction.options.getInteger('jumlah');
  const aksesRole = interaction.options.getRole('akses');
  const label = interaction.options.getString('label') || 'Pemilihan Komting';
  const tambahan = interaction.options.getString('tambahan');
  const terlihat = interaction.options.getBoolean('terlihat') ?? false;

  const extraUserIds = extractUserIds(tambahan);
  const adminRole = resolveAdminRole(interaction.guild);

  const everyoneOverwrite = terlihat
    ? { id: interaction.guild.id, deny: [PermissionFlagsBits.Connect] }
    : { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] };

  const permissionOverwrites = [
    everyoneOverwrite,
    {
      id: aksesRole.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    },
  ];

  if (adminRole && adminRole.id !== aksesRole.id) {
    permissionOverwrites.push({
      id: adminRole.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.ManageChannels,
      ],
    });
  }

  for (const userId of extraUserIds) {
    permissionOverwrites.push({
      id: userId,
      type: OverwriteType.Member,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
    });
  }

  try {
    const category = await interaction.guild.channels.create({
      name: `${KOMTING.categoryPrefix} ${label}`,
      type: ChannelType.GuildCategory,
      permissionOverwrites,
    });

    const createdChannels = [];
    for (let i = 1; i <= jumlah; i += 1) {
      const voiceChannel = await interaction.guild.channels.create({
        name: `${KOMTING.channelPrefix} ${i}`,
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites,
      });
      createdChannels.push(voiceChannel);
    }

    komtingRepo.create({
      guildId: interaction.guildId,
      categoryId: category.id,
      channelIds: createdChannels.map((c) => c.id),
      createdBy: interaction.user.id,
      label,
    });

    return interaction.editReply({
      embeds: [
        buildKomtingSuccessEmbed({
          jumlah,
          label,
          channelMentions: createdChannels.map((c) => `${c}`),
        }),
      ],
    });
  } catch (err) {
    return interaction.editReply(`❌ Gagal membuat voice channel: ${err.message}`);
  }
}

async function handleTutup(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const sesiId = interaction.options.getInteger('sesi_id');
  const session = sesiId ? komtingRepo.getById(sesiId) : komtingRepo.listOpen(interaction.guildId)[0];

  if (!session || session.closed_at || session.guild_id !== interaction.guildId) {
    return interaction.editReply({ embeds: [buildKomtingNoSessionEmbed()] });
  }

  const idsToDelete = [...session.channel_ids, session.category_id].filter(Boolean);
  for (const id of idsToDelete) {
    const channel = interaction.guild.channels.cache.get(id);
    if (channel) {
      await channel.delete().catch(() => {});
    }
  }

  komtingRepo.close(session.id);

  return interaction.editReply({ embeds: [buildKomtingCloseEmbed()] });
}

async function handleList(interaction) {
  const sessions = komtingRepo.listOpen(interaction.guildId);

  if (sessions.length === 0) {
    return interaction.reply({ ephemeral: true, embeds: [buildKomtingNoSessionEmbed()] });
  }

  const lines = sessions.map(
    (s) => `**#${s.id}** — ${s.label} (${s.channel_ids.length} channel) • dibuat oleh <@${s.created_by}>`
  );

  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle('🗳️ Sesi Pemilihan Komting Aktif')
        .setDescription(lines.join('\n')),
    ],
  });
}
