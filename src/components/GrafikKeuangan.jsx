import { useEffect, useMemo, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { dashboardApi } from '../api/index.js'
import { Card, EmptyState, Spinner } from './ui.jsx'
import { errorMessage } from '../api/client.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const compactFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`

const series = [
  { label: 'Kas Masuk', key: 'kas', color: '#f59e0b' },
  { label: 'Iuran', key: 'iuran', color: '#14b8a6' },
  { label: 'Pengeluaran', key: 'pengeluaran', color: '#f43f5e' },
]

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        boxHeight: 8,
        padding: 12,
        font: { size: 11 },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatRupiah(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { font: { size: 10 }, maxRotation: 0 },
    },
    y: {
      border: { display: false },
      grid: { color: '#f1f5f9' },
      ticks: {
        callback: (value) => `Rp ${compactFormatter.format(value)}`,
        font: { size: 10 },
        maxTicksLimit: 5,
      },
    },
  },
}

export function GrafikKeuangan() {
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
      datasets: series.map(({ label, key, color }) => ({
        label,
        data: (data ?? []).map((d) => Number(d[key] ?? 0)),
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.35,
      })),
    }),
    [data],
  )

  const adaData = (data ?? []).some((d) => d.kas || d.iuran || d.pengeluaran)

  return (
    <Card className="p-5 self-start">
      <h3 className="text-sm font-semibold text-slate-700">
        Keuangan 6 Bulan Terakhir
      </h3>

      <div className="mt-3 h-52">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">{error}</div>
        ) : !adaData ? (
          <EmptyState message="Belum ada data keuangan." />
        ) : (
          <Line data={chartData} options={chartOptions} />
        )}
      </div>
    </Card>
  )
}
