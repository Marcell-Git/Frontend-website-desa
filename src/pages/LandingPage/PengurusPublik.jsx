import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  const first = parts[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  return (first[0] || '') + (last[0] || '')
}

export default function PengurusPublik() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi.pengurus().then(setItems).catch(() => setError('Gagal memuat data pengurus'))
  }, [])

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h1 className="text-balance font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Pengurus RT 26
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Susunan pengurus yang mengelola kegiatan dan layanan warga.
          </p>
        </div>

        {error && (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!items && !error && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6">
                <span className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-4 h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-2 h-3 w-1/3 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {items?.length === 0 && (
          <p className="mt-10 text-center text-sm text-slate-500">Susunan pengurus RT belum tersedia.</p>
        )}

        {items?.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const foto = item.foto ? assetUrl(item.foto) : null
              return (
                <article
                  key={item.id}
                  className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  {foto ? (
                    <img
                      src={foto}
                      alt={item.nama_lengkap}
                      loading="lazy"
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-display text-lg font-bold text-white">
                      {getInitials(item.nama_lengkap)}
                    </span>
                  )}
                  <h3 className="mt-4 max-w-full truncate font-display text-base font-bold text-slate-900">
                    {item.nama_lengkap}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                    {item.jabatan}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}