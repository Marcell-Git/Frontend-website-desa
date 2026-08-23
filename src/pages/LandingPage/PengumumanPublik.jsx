import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../../api/index.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import { tanggalIndo } from './format.js'

export default function PengumumanPublik() {
  const { settings } = usePublicSettings()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!settings) return
    publicApi
      .pengumuman()
      .then(setItems)
      .catch(() => setError('Gagal memuat pengumuman'))
  }, [settings])

  if (!settings) return null

  if (!settings.show_pengumuman) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        Halaman pengumuman tidak tersedia.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Pengumuman
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Informasi resmi dari pengurus RT.
      </p>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {!items && !error && (
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
          Belum ada pengumuman yang dipublikasikan.
        </p>
      )}

      {items && items.length > 0 && (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/pengumuman/${item.id}`}
              className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 sm:p-6"
            >
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {tanggalIndo(item.tanggal_publikasi)}
              </span>
              <h2 className="mt-3 font-display text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-xl">
                {item.judul}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.isi}</p>
              {item.nama_user && (
                <p className="mt-3 text-xs text-slate-400">Dipublikasikan oleh {item.nama_user}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
