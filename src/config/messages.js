/**
 * =========================================================
 *  PUSAT KONTEN & TAMPILAN BOT
 * =========================================================
 *  Semua teks embed yang ditampilkan bot dikumpulkan di sini
 *  supaya gampang diedit tanpa perlu utak-atik logika lain.
 * =========================================================
 */

const COLORS = {
  primary: 0x5865f2, // blurple — identitas utama bot
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
  info: 0x2b2d31,
  leave: 0x99aab5,
};

const BRAND = {
  serverName: 'Discord Informatika — Universitas Jambi',
  footerText: 'Informatika UNJA',
};

// ---------------------------------------------------------
//  PANEL VERIFIKASI (#verify)
// ---------------------------------------------------------
const VERIFY_PANEL = {
  title: '📋 Verifikasi Keanggotaan — Informatika UNJA',
  description:
    'Selamat datang! Untuk mendapatkan akses penuh serta role yang sesuai ' +
    '(role angkatan serta kabinet, dan lainnya), setiap anggota **wajib** melakukan ' +
    'verifikasi identitas akademik terlebih dahulu.\n\n' +
    'Klik tombol **"Verifikasi Sekarang"** di bawah ini, lalu isi data sesuai ketentuan berikut:',
  rulesFieldName: '📌 Ketentuan Pengisian Data',
  rulesFieldValue:
    '**1.** Isi **Nama Lengkap** sesuai data akademik. Setiap awal kata **wajib** menggunakan **Huruf Kapital**.\n' +
    '> Contoh: `Muhammad Aziz Syah Dani`\n\n' +
    '**2.** Isi **NIM** (Nomor Induk Mahasiswa) menggunakan **HURUF KAPITAL** seluruhnya (tanpa spasi).\n' +
    '> Contoh: `F1E323001`\n\n' +
    '**3.** Pastikan Nama dan NIM **sama persis** dengan data yang terdaftar di sistem program studi.\n\n' +
    '**4.** Satu NIM hanya dapat digunakan untuk **satu akun Discord**.\n\n' +
    '⚠️ Data yang tidak sesuai format atau tidak cocok dengan basis data akan **ditolak secara otomatis**.',
  buttonLabel: 'Verifikasi Sekarang',
  footer: 'Sistem Verifikasi Otomatis • Informatika UNJA',
};

const VERIFY_MODAL = {
  title: 'Formulir Verifikasi Anggota',
  namaLabel: 'Nama Lengkap (Contoh: Muhammad Rizky Pratama)',
  namaPlaceholder: 'Muhammad Rizky Pratama',
  nimLabel: 'NIM: Huruf Kapital Semua (Contoh: F1E323001)',
  nimPlaceholder: 'F1E323001',
};

const VERIFY_RESULT = {
  invalidFormatTitle: '❌ Format Data Tidak Sesuai',
  invalidFormatDesc:
    'Data yang kamu masukkan tidak memenuhi ketentuan penulisan.\n\n' +
    '• **Nama Lengkap** hanya boleh berisi huruf, spasi, titik (.), tanda hubung (-), dan apostrof (contoh: `Muhammad Rizky Pratama`).\n' +
    '• **NIM** harus ditulis dengan **HURUF KAPITAL** semua (contoh: `F1E323001`).\n\n' +
    'Silakan klik tombol verifikasi kembali dan perbaiki data kamu.',

  notFoundTitle: '❌ Data Tidak Ditemukan',
  notFoundDesc:
    'NIM yang kamu masukkan tidak ditemukan di basis data mahasiswa Informatika UNJA.\n' +
    'Jika kamu yakin data kamu benar, silakan hubungi pengurus/admin server untuk pengecekan lebih lanjut.',

  mismatchTitle: '❌ Nama dan NIM Tidak Cocok',
  mismatchDesc:
    'NIM ditemukan, tetapi Nama Lengkap yang kamu masukkan tidak sesuai dengan data yang terdaftar.\n' +
    'Pastikan penulisan nama sama persis dengan data akademik kamu, lalu coba lagi.',

  alreadyVerifiedSelfTitle: 'ℹ️ Kamu Sudah Terverifikasi',
  alreadyVerifiedSelfDesc: 'Akun Discord kamu sudah terverifikasi sebelumnya sebagai **{nama}** ({nim}).',

  nimTakenTitle: '❌ NIM Sudah Digunakan',
  nimTakenDesc:
    'NIM ini sudah terverifikasi lebih dulu oleh akun Discord lain.\n' +
    'Jika ini adalah kesalahan atau kamu berganti akun, silakan hubungi admin server.',

  successTitle: '✅ Verifikasi Berhasil!',
  successDescBase: 'Selamat datang secara resmi, **{nama}**! Identitas kamu berhasil diverifikasi.',
  successFooter: 'Terverifikasi otomatis oleh sistem Informatika UNJA',
};

// ---------------------------------------------------------
//  AUTO WELCOMER & LEAVER
// ---------------------------------------------------------
const WELCOME = {
  title: 'Welcome to Informatika UNJA! 🎉',
  field: 'Senang melihat kamu bergabung di sini. Semoga betah, kenalan dengan teman-teman baru, dan nikmati komunitasnya',
  descriptionTemplate: 'Halo {member}, terima kasih sudah bergabung!',
  footerTemplate: 'Anggota ke {count} • Informatika UNJA',
};

const LEAVE = {
  title: 'Goodbye, Thanks for staying by! 👋',
  field: 'Terima kasih sudah menjadi bagian dari komunitas kami. Semoga sukses selalu di mana pun kamu berada!',
  descriptionTemplate: '**{tag}** telah meninggalkan server. 👋',
  footerTemplate: 'Kini berjumlah {count} anggota • Informatika UNJA',
};

// ---------------------------------------------------------
//  KOMTING
// ---------------------------------------------------------
const KOMTING = {
  categoryPrefix: '🗳️',
  channelPrefix: 'Ruang',
  // Dua voice channel ini SELALU dibuat di setiap sesi, di luar jumlah "Ruang" yang diinput admin.
  fixedMainChannelName: 'Pemilihan Komting & Wakomting',
  fixedWaitingRoomName: 'Ruang Tunggu',
  successTitle: '✅ Voice Channel Pemilihan Komting Siap',
  successDescTemplate:
    'Berhasil membuat **{total} voice channel** untuk **{label}** ' +
    '({jumlah} ruang pemilihan + 2 channel tetap).\n' +
    'Hanya anggota dengan akses yang ditentukan yang dapat melihat & bergabung ke channel ini.',
  closeSuccessTitle: '🗑️ Sesi Pemilihan Komting Ditutup',
  closeSuccessDesc: 'Seluruh voice channel & kategori pada sesi ini telah dihapus.',
  noSessionTitle: 'ℹ️ Tidak Ada Sesi Aktif',
  noSessionDesc: 'Tidak ditemukan sesi pemilihan komting yang masih terbuka di server ini.',
};

// ---------------------------------------------------------
//  PENGUMUMAN (announcement & polling)
// ---------------------------------------------------------
const ANNOUNCEMENT = {
  authorName: 'Informatika - Universitas Jambi',
  footerText: 'Pusat Informasi Informatika Universitas Jambi',
  fieldName: '📢 Pengumuman',
  color: COLORS.primary,
  // Emoji default untuk opsi polling 1-5, tampil ala pilihan ganda ujian ✨
  pollDefaultEmojis: ['🇦', '🇧', '🇨', '🇩', '🇪'],
};

module.exports = {
  COLORS,
  BRAND,
  VERIFY_PANEL,
  VERIFY_MODAL,
  VERIFY_RESULT,
  WELCOME,
  LEAVE,
  KOMTING,
  ANNOUNCEMENT,
};
