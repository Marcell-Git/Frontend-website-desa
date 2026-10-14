import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { dashboardApi } from '../api/index.js'
import { Card, EmptyState, Spinner } from './ui.jsx'
import { errorMessage } from '../api/client.js'
import '../lib/chartjs.js'

const compactFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

// Arsiran diagonal untuk batang bulan-bulan sebelumnya; bulan berjalan
// digambar penuh supaya menonjol.
function hatch(base, line) {
  if (typeof document === 'undefined') return base
  const size = 8
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)
  ctx.strokeStyle = line
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(-2, size + 2)
  ctx.lineTo(size + 2, -2)
  ctx.moveTo(-2, 2)
  ctx.lineTo(2, -2)
  ctx.moveTo(size - 2, size + 2)
  ctx.lineTo(size + 2, size - 2)
  ctx.stroke()
  return ctx.createPattern(c, 'repeat')
}

// Pemasukan = kas masuk + iuran, sesuai perhitungan saldo kas di backend.
const series = [
  {
    label: 'Pemasukan',
    value: (d) => Number(d.kas ?? 0) + Number(d.iuran ?? 0),
    solid: '#047857',
    pattern: ['#a7d7c0', '#8cc9ad'],
    dot: 'bg-emerald-700',
  },
  {
    label: 'Pengeluaran',
    value: (d) => Number(d.pengeluaran ?? 0),
    solid: '#e11d48',
    pattern: ['#fbcfd8', '#f7b6c4'],
    dot: 'bg-rose-500',
  },
]

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.label,
        label: (ctx) => `${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 11 }, color: '#64748b', maxRotation: 0 },
    },
    y: {
      border: { display: false },
      grid: { color: '#f1f5f9' },
      beginAtZero: true,
      ticks: {
        callback: (value) => `Rp ${compactFormatter.format(value)}`,
        font: { size: 10 },
        color: '#94a3b8',
        maxTicksLimit: 5,
      },
    },
  },
}

export function GrafikKeuangan({ className = '' }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    dashboardApi
      .grafik(6)
      .then((res) => {
        if (!active) return
        setData(res ?? [])
      })
      .catch((err) => {
        if (active) setError(errorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const chartData = useMemo(
    () => ({
      labels: (data ?? []).map((d) => d.bulan_label),
      datasets: series.map(({ label, value, solid, pattern }) => {
        const arsir = hatch(...pattern)
        const last = (data ?? []).length - 1
        const warna = (data ?? []).map((_, i) => (i === last ? solid : arsir))
        return {
          label,
          data: (data ?? []).map(value),
          backgroundColor: warna,
          hoverBackgroundColor: solid,
          borderRadius: 999,
          borderSkipped: false,
          maxBarThickness: 32,
          categoryPercentage: 0.7,
          barPercentage: 0.85,
        }
      }),
    }),
    [data],
  )

  const options = useMemo(
    () => ({
      ...chartOptions,
      scales: {
        ...chartOptions.scales,
        x: {
          ...chartOptions.scales.x,
          ticks: {
            ...chartOptions.scales.x.ticks,
            // "Apr 26" -> "Apr" agar sumbu X ringkas; tahun tetap terlihat di tooltip.
            callback(value) {
              return String(this.getLabelForValue(value)).split(' ')[0]
            },
          },
        },
      },
    }),
    [],
  )

  const adaData = (data ?? []).some((d) => d.kas || d.iuran || d.pengeluaran)

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Kas RT</h3>
          <p className="mt-0.5 text-xs text-slate-400">Pemasukan & pengeluaran 6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {series.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm"
            >
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">{error}</div>
        ) : !adaData ? (
          <EmptyState message="Belum ada data keuangan." />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </Card>
  )
}
