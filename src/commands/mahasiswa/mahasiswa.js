const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { studentsRepo } = require('../../database/repositories');
const { parseStudentsCSV } = require('../../utils/csv');
const { COLORS } = require('../../config/messages');
const { isValidNimFormat, isValidNamaFormat } = require('../../utils/validators');

module.exports = {
  adminOnly: true,
  data: new SlashCommandBuilder()
    .setName('mahasiswa')
    .setDescription('Kelola basis data mahasiswa Informatika UNJA (khusus ADMIN IF)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand((sub) =>
      sub
        .setName('tambah')
        .setDescription('Menambahkan / memperbarui satu data mahasiswa')
        .addStringOption((o) => o.setName('nim').setDescription('NIM — HURUF KAPITAL').setRequired(true))
        .addStringOption((o) =>
          o.setName('nama').setDescription('Nama Lengkap — Setiap Awal Kata Kapital').setRequired(true)
        )
        .addStringOption((o) => o.setName('angkatan').setDescription('Contoh: 2024').setRequired(true))
        .addStringOption((o) =>
          o.setName('jabatan').setDescription('Opsional. Contoh: Kabinet').setRequired(false)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('hapus')
        .setDescription('Menghapus data mahasiswa berdasarkan NIM')
        .addStringOption((o) => o.setName('nim').setDescription('NIM yang ingin dihapus').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('cari')
        .setDescription('Mencari data mahasiswa berdasarkan NIM')
        .addStringOption((o) => o.setName('nim').setDescription('NIM yang dicari').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('list')
        .setDescription('Menampilkan daftar mahasiswa yang terdaftar')
        .addStringOption((o) => o.setName('angkatan').setDescription('Filter angkatan (opsional)').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('import')
        .setDescription('Impor data mahasiswa secara massal dari file CSV')
        .addAttachmentOption((o) =>
          o.setName('file').setDescription('File .csv dengan kolom: nim,nama_lengkap,angkatan,jabatan').setRequired(true)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'tambah') return handleTambah(interaction);
    if (sub === 'hapus') return handleHapus(interaction);
    if (sub === 'cari') return handleCari(interaction);
    if (sub === 'list') return handleList(interaction);
    if (sub === 'import') return handleImport(interaction);
  },
};

async function handleTambah(interaction) {
  const nim = interaction.options.getString('nim').trim();
  const nama = interaction.options.getString('nama').trim();
  const angkatan = interaction.options.getString('angkatan').trim();
  const jabatan = interaction.options.getString('jabatan')?.trim() || null;

  if (!isValidNimFormat(nim) || !isValidNamaFormat(nama)) {
    return interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(COLORS.danger)
          .setTitle('❌ Format Tidak Valid')
          .setDescription(
            'NIM harus HURUF KAPITAL semua, dan Nama harus memakai Kapital di setiap awal kata.'
          ),
      ],
    });
  }

  studentsRepo.add({ nim, nama_lengkap: nama, angkatan, jabatan });

  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle('✅ Data Mahasiswa Tersimpan')
        .addFields(
          { name: 'NIM', value: nim, inline: true },
          { name: 'Nama', value: nama, inline: true },
          { name: 'Angkatan', value: angkatan, inline: true },
          ...(jabatan ? [{ name: 'Jabatan', value: jabatan, inline: true }] : [])
        ),
    ],
  });
}

async function handleHapus(interaction) {
  const nim = interaction.options.getString('nim').trim();
  const existing = studentsRepo.getByNim(nim);

  if (!existing) {
    return interaction.reply({
      ephemeral: true,
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`Data dengan NIM \`${nim}\` tidak ditemukan.`)],
    });
  }

  studentsRepo.remove(nim);

  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.success)
        .setDescription(`🗑️ Data mahasiswa **${existing.nama_lengkap}** (\`${nim}\`) berhasil dihapus.`),
    ],
  });
}

async function handleCari(interaction) {
  const nim = interaction.options.getString('nim').trim();
  const student = studentsRepo.getByNim(nim);

  if (!student) {
    return interaction.reply({
      ephemeral: true,
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription(`Data dengan NIM \`${nim}\` tidak ditemukan.`)],
    });
  }

  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle('🔎 Data Ditemukan')
        .addFields(
          { name: 'NIM', value: student.nim, inline: true },
          { name: 'Nama', value: student.nama_lengkap, inline: true },
          { name: 'Angkatan', value: student.angkatan, inline: true },
          { name: 'Jabatan', value: student.jabatan || '-', inline: true }
        ),
    ],
  });
}

async function handleList(interaction) {
  const angkatan = interaction.options.getString('angkatan')?.trim() || null;
  const students = studentsRepo.list({ angkatan, limit: 25 });
  const total = studentsRepo.count({ angkatan });

  if (students.length === 0) {
    return interaction.reply({
      ephemeral: true,
      embeds: [new EmbedBuilder().setColor(COLORS.warning).setDescription('Tidak ada data mahasiswa yang cocok.')],
    });
  }

  const lines = students.map((s) => `\`${s.nim}\` — ${s.nama_lengkap} (${s.angkatan}${s.jabatan ? `, ${s.jabatan}` : ''})`);

  return interaction.reply({
    ephemeral: true,
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.info)
        .setTitle(`📋 Daftar Mahasiswa${angkatan ? ` — Angkatan ${angkatan}` : ''}`)
        .setDescription(lines.join('\n'))
        .setFooter({ text: `Menampilkan ${students.length} dari total ${total} data` }),
    ],
  });
}

async function handleImport(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const attachment = interaction.options.getAttachment('file');
  if (!attachment.name.toLowerCase().endsWith('.csv')) {
    return interaction.editReply('❌ File harus berformat `.csv`.');
  }

  try {
    const response = await fetch(attachment.url);
    const csvText = await response.text();
    const { records, errors } = parseStudentsCSV(csvText);

    let imported = 0;
    if (records.length > 0) {
      imported = studentsRepo.bulkUpsert(records);
    }

    const embed = new EmbedBuilder()
      .setColor(errors.length > 0 ? COLORS.warning : COLORS.success)
      .setTitle('📥 Hasil Impor Data Mahasiswa')
      .addFields(
        { name: 'Berhasil Diproses', value: `${imported} data`, inline: true },
        { name: 'Baris Bermasalah', value: `${errors.length}`, inline: true }
      );

    if (errors.length > 0) {
      embed.addFields({
        name: 'Detail Masalah (maks. 10 ditampilkan)',
        value: errors.slice(0, 10).join('\n'),
      });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (err) {
    return interaction.editReply(`❌ Gagal memproses file CSV: ${err.message}`);
  }
}
