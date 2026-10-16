const BULAN_SINGKAT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const pad = (n) => String(n).padStart(2, '0')

// Nilai tanggal saja (YYYY-MM-DD, atau tengah malam UTC dari kolom DATE) dibaca apa adanya
// agar tidak bergeser hari karena zona waktu.
const TANGGAL_SAJA = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.0+)?(?:Z|[+-]00:?00)?)?$/

function toDate(value) {
  if (!value) return null
  const m = typeof value === 'string' && value.match(TANGGAL_SAJA)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Format tanggal standar aplikasi, contoh: 12-Sep-2004. */
export function formatTanggal(value) {
  const d = toDate(value)
  if (!d) return '-'
  return `${pad(d.getDate())}-${BULAN_SINGKAT[d.getMonth()]}-${d.getFullYear()}`
}

/** Format tanggal + jam, contoh: 12-Sep-2004 14:30 (atau 14:30:05 bila detik: true). */
export function formatTanggalWaktu(value, { detik = false } = {}) {
  const d = toDate(value)
  if (!d) return '-'
  const jam = `${pad(d.getHours())}:${pad(d.getMinutes())}${detik ? `:${pad(d.getSeconds())}` : ''}`
  return `${formatTanggal(d)} ${jam}`
}
