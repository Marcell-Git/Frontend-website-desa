import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../../api/index.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import StatCard from './StatCard.jsx'
import PendataanAnakKosPublik from './PendataanAnakKosPublik.jsx'
import { tanggalIndo, rupiah, getContrastTextColor } from './format.js'

const IconCalendar = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
  </svg>
)

const IconWallet = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
)

const IconWarga = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const IconPengeluaran = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const IconSaldo = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
)

const IconMegaphone = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
  </svg>
)

const IconLaporan = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

export default function Home() {
  const { settings } = usePublicSettings()
  const showPengumuman = !settings || settings.show_pengumuman
  const showLaporan = !settings || settings.show_laporan

  const [pengumuman, setPengumuman] = useState([])
  const [laporan, setLaporan] = useState(null)
  const [beritaKegiatan, setBeritaKegiatan] = useState([])

  useEffect(() => {
    let active = true
    if (showPengumuman && settings) {
      publicApi
        .pengumuman()
        .then((data) => {
          if (active) setPengumuman((data ?? []).slice(0, 3))
        })
        .catch(() => {})
    }
    if (showLaporan && settings) {
      publicApi
        .laporan()
        .then((data) => {
          if (active) setLaporan(data)
        })
        .catch(() => {})
    }
    publicApi
      .beritaKegiatan()
      .then((data) => {
        if (active) setBeritaKegiatan((data ?? []).slice(0, 3))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [settings, showPengumuman, showLaporan])

  const lokasi = settings
    ? [settings.desa, settings.kecamatan, settings.kabupaten].filter(Boolean).join(', ')
    : ''

  const heroActions = [
    showPengumuman && { to: '/pengumuman', label: 'Pengumuman', Icon: IconMegaphone },
    { to: '/berita-kegiatan', label: 'Berita & Kegiatan', Icon: IconCalendar },
    showLaporan && { to: '/laporan', label: 'Laporan Keuangan', Icon: IconLaporan },
  ].filter(Boolean)

  return (
    <div>
      <section className="hero-bg relative bg-emerald-950 bg-cover bg-bottom">
        <div
          className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/60 to-emerald-950/75"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <h1 className="animate-hero-rise text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            {settings?.nama_website || 'Sistem Informasi RT'}
          </h1>
          {lokasi && (
            <p className="animate-hero-rise mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-100 sm:text-base">
              <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {lokasi}
            </p>
          )}
          <p className="animate-hero-rise mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
            Media informasi resmi warga: pengumuman, transparansi laporan keuangan, dan sarana
            penyampaian pengaduan masyarakat.
          </p>
          {heroActions.length > 0 && (
            <div className="animate-hero-rise-late mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
                Apa yang Anda cari hari ini?
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-center gap-x-4 gap-y-5 sm:gap-x-10">
                {heroActions.map(({ to, label, Icon }) => (
                  <Link key={to} to={to} className="group flex w-20 flex-col items-center gap-2 sm:w-24">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:border-white/60 group-hover:bg-white/20">
                      <Icon />
                    </span>
                    <span className="text-xs font-medium text-emerald-100 transition-colors group-hover:text-white sm:text-sm">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {showLaporan && laporan?.ringkasan && (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Transparansi Keuangan
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ringkasan keuangan RT tahun {laporan.tahun}
              </p>
            </div>
            <Link
              to="/laporan"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Lihat rincian
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total Kas" value={rupiah(laporan.ringkasan.total_kas)} icon={<IconWallet />} />
            <StatCard label="Total Iuran" value={rupiah(laporan.ringkasan.total_iuran)} icon={<IconWarga />} />
            <StatCard label="Total Pengeluaran" value={rupiah(laporan.ringkasan.total_pengeluaran)} icon={<IconPengeluaran />} />
            <StatCard label="Saldo Akhir" value={rupiah(laporan.ringkasan.saldo_akhir)} highlight icon={<IconSaldo />} />
          </div>
        </section>
      )}

      {showPengumuman && (
        <section className={`mx-auto max-w-6xl px-4 pb-16 ${!showLaporan ? 'pt-14' : ''}`}>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pengumuman Terbaru
            </h2>
            <Link
              to="/pengumuman"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Semua pengumuman
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          {pengumuman.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
              Belum ada pengumuman yang dipublikasikan.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {pengumuman.map((item) => (
                <Link
                  key={item.id}
                  to={`/pengumuman/${item.id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {tanggalIndo(item.tanggal_publikasi)}
                  </span>
                  <h3 className="mt-3 font-display text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-lg">
                    {item.judul}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                    {item.isi}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                    Baca selengkapnya
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h2 className="text-balance font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Berita &amp; Kegiatan Warga
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Agenda gotong royong, pertemuan warga, dan kabar lingkungan terbaru.
            </p>
          </div>
          <Link
            to="/berita-kegiatan"
            className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
          >
            Semua berita &amp; kegiatan
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        {beritaKegiatan.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center text-sm text-slate-400">
            Belum ada agenda atau berita kegiatan saat ini.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {beritaKegiatan.map((item) => {
              const labelColor = item.warna_label || '#047857'
              const textColor = getContrastTextColor(labelColor)
              return (
                <Link
                  key={item.id}
                  to="/berita-kegiatan"
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-emerald-900/5"
                >
                  <div
                    className="absolute left-0 top-0 h-1.5 w-full transition-colors"
                    style={{ backgroundColor: labelColor }}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold shadow-xs"
                      style={{ backgroundColor: labelColor, color: textColor }}
                    >
                      {item.kategori}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {tanggalIndo(item.tanggal)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700 sm:text-lg">
                    {item.judul}
                  </h3>
                  {item.keterangan && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                      {item.keterangan}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
                    <span className="truncate">📍 {item.lokasi}</span>
                    <span className="shrink-0">⏰ {item.jam} WIB</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      <PendataanAnakKosPublik />
    </div>
  )
}

