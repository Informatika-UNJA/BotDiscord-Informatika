const { parse } = require('csv-parse/sync');

/**
 * Mem-parsing teks CSV mahasiswa dengan kolom wajib: nim, nama_lengkap, angkatan
 * dan kolom opsional: jabatan.
 * Mengembalikan { records, errors } — records siap di-bulkUpsert, errors berisi baris bermasalah.
 */
function parseStudentsCSV(csvText) {
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const records = [];
  const errors = [];

  rows.forEach((row, index) => {
    const nim = (row.nim || '').trim();
    const nama_lengkap = (row.nama_lengkap || '').trim();
    const angkatan = (row.angkatan || '').trim();
    const jabatan = (row.jabatan || '').trim() || null;

    if (!nim || !nama_lengkap || !angkatan) {
      errors.push(`Baris ${index + 2}: kolom nim/nama_lengkap/angkatan tidak lengkap.`);
      return;
    }

    records.push({ nim, nama_lengkap, angkatan, jabatan });
  });

  return { records, errors };
}

module.exports = { parseStudentsCSV };
