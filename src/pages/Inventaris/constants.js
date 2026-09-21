export const KONDISI_META = {
  baik: { label: 'Baik', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  'rusak-ringan': { label: 'Rusak Ringan', badge: 'border-amber-200 bg-amber-50 text-amber-700' },
  'rusak-berat': { label: 'Rusak Berat', badge: 'border-red-200 bg-red-50 text-red-700' },
  'perlu-perbaikan': { label: 'Perlu Perbaikan', badge: 'border-orange-200 bg-orange-50 text-orange-700' },
}

export const KONDISI_OPTIONS = Object.entries(KONDISI_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}))

export const KATEGORI_PRESETS = [
  { kategori: 'Perlengkapan Aula', warna: '#047857' },
  { kategori: 'Meja & Kursi', warna: '#0D9488' },
  { kategori: 'Sound System', warna: '#7C3AED' },
  { kategori: 'Dokumentasi', warna: '#2563EB' },
  { kategori: 'Alat Kerja Bakti', warna: '#D97706' },
  { kategori: 'Keamanan & Ronda', warna: '#DC2626' },
  { kategori: 'Lainnya', warna: '#475569' },
]

export const COLOR_PRESETS = [
  { label: 'Emerald (Umum)', value: '#047857' },
  { label: 'Teal (Meja & Kursi)', value: '#0D9488' },
  { label: 'Ungu (Sound System)', value: '#7C3AED' },
  { label: 'Royal Blue (Dokumentasi)', value: '#2563EB' },
  { label: 'Amber (Alat Kerja Bakti)', value: '#D97706' },
  { label: 'Merah (Keamanan)', value: '#DC2626' },
  { label: 'Slate (Lainnya)', value: '#475569' },
]