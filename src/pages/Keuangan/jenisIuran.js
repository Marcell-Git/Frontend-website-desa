import { NAMA_BULAN } from '../../components/PembayaranBulanan.jsx'

/** Kolom DATE dari API ("2026-01-01T00:00:00Z") → "2026-01". */
export const toPeriode = (value) => (value ? String(value).slice(0, 7) : '')

const singkat = (value) => {
  const p = toPeriode(value)
  if (!p) return ''
  const [y, m] = p.split('-').map(Number)
  return `${NAMA_BULAN[m - 1].slice(0, 3)} ${y}`
}

/** Teks masa berlaku jenis iuran, contoh: "Mulai Jan 2026 · selamanya" atau "Jul 2026 – Agu 2026". */
export function labelBerlaku(jenis) {
  if (!jenis?.bulan_mulai) return 'Belum diatur'
  if (jenis.tipe_periode === 'periode') return `${singkat(jenis.bulan_mulai)} – ${singkat(jenis.bulan_selesai)}`
  return `Mulai ${singkat(jenis.bulan_mulai)} · selamanya`
}
