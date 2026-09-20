import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { tanggalIndo, getContrastTextColor } from './format.js'

const IconCalendar = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
)

const IconClock = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
)

const IconPin = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

function CalendarTile({ date }) {
  const parsed = new Date(date)
  const valid = !Number.isNaN(parsed.getTime())
  const day = valid ? new Intl.DateTimeFormat('id-ID', { day: '2-digit' }).format(parsed) : '-'
  const month = valid ? new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(parsed) : ''
  return <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><span className="text-lg font-extrabold leading-none">{day}</span><span className="mt-1 text-[10px] font-bold uppercase tracking-wide">{month}</span></div>
}

export default function BeritaKegiatanPublik() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi.beritaKegiatan().then(setItems).catch(() => setError('Gagal memuat berita dan kegiatan'))
  }, [])

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-white">
      <main className="mx-auto max-w-4xl px-4 py-12">
        <header>
          <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Berita &amp; Kegiatan</h1>
          <p className="mt-1 text-sm text-slate-500">Kabar terbaru, agenda, dan kegiatan bersama di lingkungan RT.</p>
        </header>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!items && !error && (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {items?.length === 0 && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <IconCalendar />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Belum ada informasi</h2>
            <p className="mt-2 text-sm text-slate-500">Berita dan kegiatan warga akan tampil di halaman ini.</p>
          </div>
        )}

        {items?.length > 0 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {items.map((item) => {
              const labelColor = item.warna_label || '#047857'
              const textColor = getContrastTextColor(labelColor)
              return (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-emerald-900/10 sm:p-6"
                >
                  <div
                    className="absolute left-0 top-0 h-1.5 w-full transition-colors"
                    style={{ backgroundColor: labelColor }}
                  />
                  <div className="flex items-start gap-4">
                    <CalendarTile date={item.tanggal} />
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-sm"
                        style={{ backgroundColor: labelColor, color: textColor }}
                      >
                        {item.kategori}
                      </span>
                      <h3 className="mt-3 font-display text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">
                        {item.judul}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 border-y border-slate-100 py-4 text-sm text-slate-600">

                    <p className="flex items-center gap-2">
                      <span className="text-emerald-700"><IconCalendar /></span>{tanggalIndo(item.tanggal)}</p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-700"><IconClock /></span>{item.jam} WIB</p>
                    <p className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-700"><IconPin /></span><span>{item.lokasi}</span>
                    </p>
                  </div>
                  {item.keterangan && (
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                      {item.keterangan}
                    </p>
                  )}
                </article>

              )
            })}
          </div>
        )}
      </main>

    </div>
  )
}
