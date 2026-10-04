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

/**
 * Validasi format nama untuk input VERIFIKASI (toleran).
 * Kapitalisasi TIDAK dipermasalahkan; yang ditolak hanya karakter yang jelas bukan bagian dari nama
 * (angka, emoji, simbol aneh). Karakter yang diizinkan: huruf, spasi, titik, tanda hubung, apostrof.
 * Contoh valid: "muhammad aziz", "Al-Zaky", "m. abizar", "Mir'atil Hayati"
 */
const NAMA_INPUT_REGEX = /^[a-zA-Z][a-zA-Z .'\u2018\u2019\-\u2010-\u2015]*$/;

function isValidNamaInput(nama) {
  if (typeof nama !== 'string') return false;
  return NAMA_INPUT_REGEX.test(nama.trim());
}

/**
 * Menyeragamkan nama sebelum dibandingkan, supaya pencocokan toleran:
 *  1. lowercase                       "Muhammad Aziz"  -> "muhammad aziz"
 *  2. hapus tanda hubung              "Al-Zaky"        -> "alzaky"
 *  3. hapus apostrof                  "Mir'atil"       -> "miratil"
 *  4. titik dianggap spasi            "M.Raffi", "M. Raffi" -> "m raffi"
 *  5. spasi ganda jadi satu + trim    "  Muhammad   Aziz " -> "muhammad aziz"
 * Selama hurufnya benar, hasil sanitize dari input user dan data CSV akan sama.
 */
function sanitizeName(name) {
  if (typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/[-\u2010-\u2015]/g, '') // hyphen / dash (termasuk variasi unicode dari keyboard HP)
    .replace(/['\u2018\u2019\u02bc]/g, '') // apostrof lurus & melengkung (iOS/Android sering melengkungkan)
    .replace(/\./g, ' ') // "M." dan "M.Raffi" sama-sama jadi "m ..."
    .replace(/\s+/g, ' ')
    .trim();
}

/** true jika dua nama dianggap sama setelah disanitize. */
function isSameName(a, b) {
  const left = sanitizeName(a);
  return left.length > 0 && left === sanitizeName(b);
}

module.exports = {
  isValidNamaFormat,
  isValidNimFormat,
  isValidNamaInput,
  normalize,
  sanitizeName,
  isSameName,
};
