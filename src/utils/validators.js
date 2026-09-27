/**
 * Setiap awal kata pada nama wajib Huruf Kapital.
 * Contoh valid   : "Muhammad Rizky Pratama", "Siti Nur Aisyah"
 * Contoh tidak valid: "muhammad rizky", "MUHAMMAD RIZKY", "Muhammad rizky"
 */
const NAMA_REGEX = /^[A-Z][a-zA-Z'.]*(?:[ ][A-Z][a-zA-Z'.]*)*$/;

function isValidNamaFormat(nama) {
  if (typeof nama !== 'string') return false;
  return NAMA_REGEX.test(nama.trim());
}

/**
 * NIM wajib ditulis HURUF KAPITAL semua (jika mengandung huruf) dan tanpa spasi.
 * Contoh valid   : "G1A024001"
 * Contoh tidak valid: "g1a024001", "G1a024001", "G1A 024001"
 */
function isValidNimFormat(nim) {
  if (typeof nim !== 'string') return false;
  const trimmed = nim.trim();
  if (trimmed.length === 0) return false;
  if (/\s/.test(trimmed)) return false;
  return trimmed === trimmed.toUpperCase();
}

function normalize(str) {
  return str.trim().replace(/\s+/g, ' ');
}

module.exports = { isValidNamaFormat, isValidNimFormat, normalize };
