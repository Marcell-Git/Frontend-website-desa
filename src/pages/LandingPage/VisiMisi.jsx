import { Navigate } from 'react-router-dom'
import { usePublicSettings } from '../../components/PublicLayout.jsx'

export default function VisiMisi() {
  const { settings } = usePublicSettings()

  if (settings && !settings.show_visi_misi) return <Navigate to="/" replace />

  const misi = settings?.misi || []

  return (
    <div className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Arah Bersama</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Visi &amp; Misi</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">Landasan bagi warga dan pengurus dalam membangun lingkungan yang lebih baik.</p>
        </div>

        <section className="mt-10 rounded-2xl bg-emerald-900 px-6 py-8 text-center shadow-lg shadow-emerald-950/10 sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Visi</p>
          {settings?.visi ? (
            <p className="mx-auto mt-4 max-w-3xl font-display text-xl font-bold leading-relaxed text-white sm:text-2xl">“{settings.visi}”</p>
          ) : (
            <p className="mt-4 text-sm text-emerald-100">Visi belum tersedia.</p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Misi</h2>
          {misi.length > 0 ? (
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {misi.map((item, index) => (
                <li key={`${index}-${item}`} className="flex gap-4 rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-slate-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Misi belum tersedia.</p>
          )}
        </section>
      </div>
    </div>
  )
}
