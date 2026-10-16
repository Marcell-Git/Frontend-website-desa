import { useEffect, useState } from 'react'
import { publicApi } from '../../api/index.js'
import { assetUrl } from '../../api/config.js'
import { formatTanggal } from '../../lib/tanggal.js'

const IconBook = () => (
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const IconExternal = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m0-7l-5 5m0 0h6m-6 0v6" />
  </svg>
)

function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return formatTanggal(date)
}

export default function PeraturanPublik() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    publicApi.peraturan().then(setItems).catch(() => setError('Gagal memuat data peraturan'))
  }, [])

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-slate-50">
      <div className="bg-emerald-800 pb-16 pt-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/60 text-emerald-100">
              <IconBook />
            </span>
            <div>
              <h1 className="text-balance font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Peraturan RT
              </h1>
              <p className="mt-1 text-sm text-emerald-100/85">
                Dokumen peraturan yang berlaku di wilayah RT 26, dapat dibaca langsung di halaman ini.
              </p>
            </div>
          </div>
          {items && items.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-emerald-100/80">Dokumen</div>
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
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {items?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <IconBook />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">Belum ada peraturan</h2>
            <p className="mt-2 text-sm text-slate-500">
              Dokumen yang diunggah pengurus akan tampil di halaman ini.
            </p>
          </div>
        )}

        {items?.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const fileUrl = assetUrl(item.file_pdf)
              const meta = formatDate(item.created_at)
              return (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  <div className="relative h-56 w-full border-b border-slate-200 bg-slate-100">
                    <iframe
                      src={`${fileUrl}#page=1&view=FitH&toolbar=0`}
                      title={`Pratinjau ${item.judul}`}
                      className="h-full w-full"
                      loading="lazy"
                    />
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-md bg-slate-900/75 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                      PDF
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-display text-base font-bold leading-snug text-slate-900">
                      {item.judul}
                    </h2>
                    {meta && <p className="mt-1.5 text-xs font-medium text-slate-400">{meta}</p>}
                    <div className="mt-auto pt-4">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                      >
                        <IconExternal />
                        Buka Peraturan
                      </a>
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
