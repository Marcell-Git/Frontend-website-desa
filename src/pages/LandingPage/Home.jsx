import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { publicApi } from '../../api/index.js'
import { usePublicSettings } from '../../components/PublicLayout.jsx'
import { tanggalIndo, rupiah } from './format.js'

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-bold sm:text-xl ${highlight ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value}
      </div>
    </div>
  )
}

export default function Home() {
  const { settings } = usePublicSettings()
  const showPengumuman = !settings || settings.show_pengumuman
  const showLaporan = !settings || settings.show_laporan
  const showPengaduan = !settings || settings.show_pengaduan

  const [pengumuman, setPengumuman] = useState([])
  const [laporan, setLaporan] = useState(null)

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
    return () => {
      active = false
    }
  }, [settings, showPengumuman, showLaporan])

  const lokasi = settings
    ? [settings.desa, settings.kecamatan, settings.kabupaten].filter(Boolean).join(', ')
    : ''

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600 py-16 text-center text-white sm:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-medium tracking-wide text-emerald-100 ring-1 ring-white/25">
            {settings?.nama_rt || 'RT 26'} • RW 07 • Kelurahan Tegalyoso
          </span>
          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {settings?.nama_website || 'Sistem Informasi RT'}
          </h1>
          {lokasi && <p className="mt-3 text-sm text-emerald-100 sm:text-base">{lokasi}</p>}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 sm:text-base">
            Media informasi resmi warga: pengumuman, transparansi laporan keuangan, dan sarana
            penyampaian pengaduan masyarakat.
          </p>
          {(showLaporan || showPengaduan) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {showLaporan && (
                <Link
                  to="/laporan"
                  className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow transition-colors hover:bg-emerald-50"
                >
                  Lihat Laporan Keuangan
                </Link>
              )}
              {showPengaduan && (
                <Link
                  to="/pengaduan"
                  className="rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Kirim Pengaduan
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {showLaporan && laporan?.ringkasan && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Transparansi Keuangan</h2>
              <p className="mt-1 text-sm text-slate-500">
                Ringkasan keuangan RT tahun {laporan.tahun}
              </p>
            </div>
            <Link to="/laporan" className="text-sm font-medium text-emerald-700 hover:underline">
              Lihat rincian →
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard label="Total Kas" value={rupiah(laporan.ringkasan.total_kas)} />
            <StatCard label="Total Iuran" value={rupiah(laporan.ringkasan.total_iuran)} />
            <StatCard label="Total Pengeluaran" value={rupiah(laporan.ringkasan.total_pengeluaran)} />
            <StatCard label="Saldo Akhir" value={rupiah(laporan.ringkasan.saldo_akhir)} highlight />
          </div>
        </section>
      )}

      {showPengumuman && (
        <section className={`mx-auto max-w-6xl px-4 py-12 ${!showLaporan ? 'pt-12' : ''}`}>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900">Pengumuman Terbaru</h2>
            <Link to="/pengumuman" className="text-sm font-medium text-emerald-700 hover:underline">
              Semua pengumuman →
            </Link>
          </div>

          {pengumuman.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-400">
              Belum ada pengumuman yang dipublikasikan.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pengumuman.map((item) => (
                <Link
                  key={item.id}
                  to={`/pengumuman/${item.id}`}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {tanggalIndo(item.tanggal_publikasi)}
                  </span>
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-emerald-700">
                    {item.judul}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                    {item.isi}
                  </p>
                  <span className="mt-3 text-sm font-medium text-emerald-700">Baca selengkapnya →</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {showPengaduan && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-emerald-900">Ada keluhan atau laporan?</h2>
              <p className="mt-1 text-sm leading-relaxed text-emerald-800">
                Sampaikan pengaduan Anda kepada pengurus RT tanpa perlu login. Setiap pengaduan akan
                ditindaklanjuti.
              </p>
            </div>
            <Link
              to="/pengaduan"
              className="shrink-0 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              Kirim Pengaduan
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
