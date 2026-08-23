import { usePublicSettings } from '../../components/PublicLayout.jsx'

function KontakItem({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export default function Kontak() {
  const { settings } = usePublicSettings()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Kontak
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Hubungi pengurus RT untuk informasi lebih lanjut.
      </p>

      <div className="mt-8 space-y-4">
        <KontakItem
          label="Alamat"
          value={settings?.alamat}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <KontakItem
          label="Telepon"
          value={settings?.telepon}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
        />
        <KontakItem
          label="Email"
          value={settings?.email}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        {!settings?.alamat && !settings?.telepon && !settings?.email && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
            Informasi kontak belum tersedia.
          </p>
        )}
      </div>

      {settings && (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm leading-relaxed text-emerald-900">
          <span className="font-display font-bold">{settings.nama_website}</span> —{' '}
          {[settings.nama_rt, settings.desa, settings.kecamatan, settings.kabupaten, settings.provinsi]
            .filter(Boolean)
            .join(', ')}
        </div>
      )}
    </div>
  )
}
