import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicApi } from '../../api/index.js'
import { errorMessage } from '../../api/client.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import { tanggalIndo } from './format.js'

export default function DetailPengumumanPublik() {
  const { id } = useParams()
  const { settings } = usePublicSettings()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!settings) return
    let active = true
    publicApi
      .pengumumanDetail(id)
      .then((data) => {
        if (active) setItem(data)
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
    return () => {
      active = false
    }
  }, [id, settings])

  if (!settings) return null

  if (!settings.show_pengumuman) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-slate-500">
        Halaman pengumuman tidak tersedia.
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-slate-500">{error}</p>
        <Link to="/pengumuman" className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline">
          ← Kembali ke daftar pengumuman
        </Link>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="h-8 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <Link
        to="/pengumuman"
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
      >
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
          ←
        </span>
        Kembali ke daftar pengumuman
      </Link>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {tanggalIndo(item.tanggal_publikasi)}
        </span>
        <h1 className="text-balance mt-4 font-display text-2xl font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl">
          {item.judul}
        </h1>
        {item.nama_user && (
          <p className="mt-3 text-xs text-slate-400">Dipublikasikan oleh {item.nama_user}</p>
        )}
        <div className="my-6 border-t border-slate-100" />
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{item.isi}</p>
      </div>
    </article>
  )
}
