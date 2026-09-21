import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { getContrastTextColor } from './format.js'
import { KONDISI_META } from '../Inventaris/constants.js'

const IconBox = () => (
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)

const IconMapPin = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const IconUser = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export default function InventarisPublik() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi.inventaris().then(setItems).catch(() => setError('Gagal memuat data inventaris'))
  }, [])

  const totalBarang = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (Number(item.jumlah_barang) || 0), 0)
    : 0

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-slate-50">
      <div className="bg-emerald-800 pb-16 pt-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/60 text-emerald-100">
              <IconBox />
            </span>
            <div>
              <h1 className="text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Inventaris Barang RT
              </h1>
              <p className="mt-1 text-sm text-emerald-100/85">
                Daftar barang milik bersama yang dikelola pengurus RT.
              </p>
            </div>
          </div>
          {items && (
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-100/80">Jenis Barang</div>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                <div className="text-2xl font-bold">{totalBarang}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-100/80">Total Unit</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto -mt-8 max-w-6xl px-4 pb-16">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!items && !error && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {items?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <IconBox />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Belum ada data inventaris</h2>
            <p className="mt-2 text-sm text-slate-500">Barang milik bersama RT akan tampil di halaman ini.</p>
          </div>
        )}

        {items?.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const labelColor = item.warna_label || '#047857'
              const kondisi = KONDISI_META[item.kondisi_barang] || KONDISI_META.baik
              const foto = item.foto ? assetUrl(item.foto) : null
              return (
                <article
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  <div className="absolute left-0 top-0 z-10 h-1.5 w-full" style={{ backgroundColor: labelColor }} />
                  {foto ? (
                    <img
                      src={foto}
                      alt={item.nama_barang}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-300">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                        <IconBox />
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold shadow-xs"
                        style={{ backgroundColor: labelColor, color: getContrastTextColor(labelColor) }}
                      >
                        {item.kategori || 'Barang'}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${kondisi.badge}`}>
                        {kondisi.label}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold leading-snug text-slate-900">
                      {item.nama_barang}
                    </h3>
                    {item.keterangan && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">{item.keterangan}</p>
                    )}
                    <div className="mt-auto space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                      <p className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-400">Jumlah</span>
                        <span>{item.jumlah_barang} unit</span>
                      </p>
                      {item.lokasi_penyimpanan && (
                        <p className="flex items-center gap-2">
                          <span className="shrink-0 text-emerald-700"><IconMapPin /></span>
                          <span className="truncate">{item.lokasi_penyimpanan}</span>
                        </p>
                      )}
                      {item.penanggung_jawab && (
                        <p className="flex items-center gap-2">
                          <span className="shrink-0 text-emerald-700"><IconUser /></span>
                          <span className="truncate">{item.penanggung_jawab}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}