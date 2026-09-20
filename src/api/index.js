import client from './client.js'

function normalizePaginated(d) {
  return { data: d?.data ?? [], pagination: d?.pagination ?? {} }
}

export const authApi = {
  login: (username, password) =>
    client.post('/auth/login', { username, password }).then((r) => r.data.data),
  profile: () => client.get('/auth/profile').then((r) => r.data.data),
  logout: (refreshToken) =>
    client.post('/auth/logout', { refresh_token: refreshToken }),
  changePassword: (oldPassword, newPassword) =>
    client.put('/auth/password', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
}

export const dashboardApi = {
  summary: () => client.get('/dashboard').then((r) => r.data.data),
  grafik: (bulan) =>
    client
      .get('/dashboard/grafik', { params: bulan ? { bulan } : {} })
      .then((r) => r.data.data),
}

export const publicApi = {
  pengumuman: () =>
    client.get('/public/pengumuman').then((r) => r.data.data ?? []),
  pengumumanDetail: (id) =>
    client.get(`/public/pengumuman/${id}`).then((r) => r.data.data),
  laporan: (tahun) =>
    client
      .get('/public/laporan', { params: tahun ? { tahun } : {} })
      .then((r) => r.data.data),
  beritaKegiatan: () =>
    client.get('/public/berita-kegiatan').then((r) => r.data.data ?? []),
}

export const kkApi = {
  list: (params) =>
    client.get('/kartu-keluarga', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/kartu-keluarga/${id}`).then((r) => r.data.data),
  ocr: (formData) =>
    client.post('/kartu-keluarga/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }).then((r) => r.data.data),
  create: (body) =>
    client.post('/kartu-keluarga', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/kartu-keluarga/${id}`, body).then((r) => r.data.data),
  remove: (id) =>
    client.delete(`/kartu-keluarga/${id}`).then((r) => r.data.data),
}

export const anggotaApi = {
  list: (params) =>
    client.get('/anggota', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/anggota/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/anggota', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/anggota/${id}`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/anggota/${id}`).then((r) => r.data.data),
  setKepala: (id) =>
    client.patch(`/anggota/${id}/kepala`).then((r) => r.data.data),
  move: (id, kartuKeluargaId) =>
    client
      .patch(`/anggota/${id}/pindah`, { kartu_keluarga_id: kartuKeluargaId })
      .then((r) => r.data.data),
}

export const kasApi = {
  list: (params) =>
    client.get('/kas', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/kas/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/kas', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/kas/${id}`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/kas/${id}`).then((r) => r.data.data),
}

export const jenisIuranApi = {
  list: (params) =>
    client.get('/jenis-iuran', { params }).then((r) => r.data.data).then(normalizePaginated),
  create: (body) =>
    client.post('/jenis-iuran', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/jenis-iuran/${id}`, body).then((r) => r.data.data),
  remove: (id) =>
    client.delete(`/jenis-iuran/${id}`).then((r) => r.data.data),
}

export const iuranApi = {
  list: (params) =>
    client.get('/iuran', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/iuran/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/iuran', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/iuran/${id}`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/iuran/${id}`).then((r) => r.data.data),
}

export const kategoriPengeluaranApi = {
  list: (params) =>
    client.get('/kategori-pengeluaran', { params }).then((r) => r.data.data).then(normalizePaginated),
  create: (body) =>
    client.post('/kategori-pengeluaran', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/kategori-pengeluaran/${id}`, body).then((r) => r.data.data),
  remove: (id) =>
    client.delete(`/kategori-pengeluaran/${id}`).then((r) => r.data.data),
}

export const pengeluaranApi = {
  list: (params) =>
    client.get('/pengeluaran', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/pengeluaran/${id}`).then((r) => r.data.data),
  create: (body) =>
    client.post('/pengeluaran', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/pengeluaran/${id}`, body).then((r) => r.data.data),
  remove: (id) =>
    client.delete(`/pengeluaran/${id}`).then((r) => r.data.data),
}

export const pengumumanApi = {
  list: (params) =>
    client.get('/pengumuman', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/pengumuman/${id}`).then((r) => r.data.data),
  create: (body) =>
    client.post('/pengumuman', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/pengumuman/${id}`, body).then((r) => r.data.data),
  remove: (id) =>
    client.delete(`/pengumuman/${id}`).then((r) => r.data.data),
}

export const anakKosApi = {
  list: (params) =>
    client.get('/anak-kos', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/anak-kos/${id}`).then((r) => r.data.data),
  ocr: (formData) =>
    client.post('/anak-kos/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }).then((r) => r.data.data),
  create: (body) => client.post('/anak-kos', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/anak-kos/${id}`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/anak-kos/${id}`).then((r) => r.data.data),
}

export const pengaduanApi = {
  submit: (formData) =>
    client.post('/public/pengaduan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }).then((r) => r.data.data),
  list: (params) =>
    client.get('/pengaduan', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/pengaduan/${id}`).then((r) => r.data.data),
  updateStatus: (id, body) =>
    client.patch(`/pengaduan/${id}/status`, body).then((r) => r.data.data),
  addCatatan: (id, body) =>
    client.post(`/pengaduan/${id}/catatan`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/pengaduan/${id}`).then((r) => r.data.data),
  downloadBukti: (id) =>
    client.get(`/pengaduan/${id}/bukti`, { responseType: 'blob' }),
}

export const auditLogApi = {
  list: (params) =>
    client.get('/audit-logs', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/audit-logs/${id}`).then((r) => r.data.data),
}

export const reportApi = {
  kas: (params) => client.get('/reports/kas', { params }).then((r) => r.data.data),
  iuran: (params) => client.get('/reports/iuran', { params }).then((r) => r.data.data),
  pengeluaran: (params) => client.get('/reports/pengeluaran', { params }).then((r) => r.data.data),
  keuangan: (params) => client.get('/reports/keuangan', { params }).then((r) => r.data.data),
}

function buildExportUrl(base, params) {
  const q = new URLSearchParams()
  if (params.bulan) q.set('bulan', params.bulan)
  if (params.tahun) q.set('tahun', params.tahun)
  if (params.tanggal_mulai) q.set('tanggal_mulai', params.tanggal_mulai)
  if (params.tanggal_akhir) q.set('tanggal_akhir', params.tanggal_akhir)
  if (params.jenis_iuran_id) q.set('jenis_iuran_id', params.jenis_iuran_id)
  if (params.kategori_pengeluaran_id) q.set('kategori_pengeluaran_id', params.kategori_pengeluaran_id)
  const qs = q.toString()
  return qs ? `${base}?${qs}` : base
}

function downloadBlob(url, filename) {
  return client.get(url, { responseType: 'blob' }).then((res) => {
    const blob = new Blob([res.data])
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  })
}

export const rolesApi = {
  list: (params) =>
    client.get('/roles', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/roles/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/roles', body).then((r) => r.data.data),
  update: (id, body) => client.put(`/roles/${id}`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/roles/${id}`).then((r) => r.data.data),
  getPermissions: (id) => client.get(`/roles/${id}/permissions`).then((r) => r.data.data),
  updatePermissions: (id, body) => client.put(`/roles/${id}/permissions`, body).then((r) => r.data.data),
}

export const permissionsApi = {
  list: () => client.get('/permissions').then((r) => r.data.data),
}

export const settingsApi = {
  get: () => client.get('/website-settings').then((r) => r.data.data),
  update: (body) => client.put('/website-settings', body).then((r) => r.data.data),
  uploadLogo: (formData) =>
    client.post('/website-settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    }).then((r) => r.data.data),
}

export const userApi = {
  list: (params) =>
    client.get('/users', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/users/${id}`).then((r) => r.data.data),
  create: (body) => client.post('/users', body).then((r) => r.data.data),
  update: (id, body) =>
    client.put(`/users/${id}`, body).then((r) => r.data.data),
  updateStatus: (id, body) =>
    client.patch(`/users/${id}/status`, body).then((r) => r.data.data),
  resetPassword: (id, body) =>
    client.patch(`/users/${id}/password`, body).then((r) => r.data.data),
  remove: (id) => client.delete(`/users/${id}`).then((r) => r.data.data),
}

export const exportApi = {
  kasPdf: (params) =>
    downloadBlob(buildExportUrl('/export/kas/pdf', params), `laporan-kas-${Date.now()}.pdf`),
  kasExcel: (params) =>
    downloadBlob(buildExportUrl('/export/kas/excel', params), `laporan-kas-${Date.now()}.xlsx`),
  iuranPdf: (params) =>
    downloadBlob(buildExportUrl('/export/iuran/pdf', params), `laporan-iuran-${Date.now()}.pdf`),
  iuranExcel: (params) =>
    downloadBlob(buildExportUrl('/export/iuran/excel', params), `laporan-iuran-${Date.now()}.xlsx`),
  pengeluaranPdf: (params) =>
    downloadBlob(buildExportUrl('/export/pengeluaran/pdf', params), `laporan-pengeluaran-${Date.now()}.pdf`),
  pengeluaranExcel: (params) =>
    downloadBlob(buildExportUrl('/export/pengeluaran/excel', params), `laporan-pengeluaran-${Date.now()}.xlsx`),
}

export const backupApi = {
  list: (params) =>
    client.get('/backup', { params }).then((r) => r.data.data).then(normalizePaginated),
  create: () =>
    client.post('/backup', {}, { timeout: 600000 }).then((r) => r.data.data),
  download: (id, filename) => downloadBlob(`/backup/${id}/download`, filename),
  restore: (id) =>
    client.post(`/backup/${id}/restore`, {}, { timeout: 600000 }).then((r) => r.data),
  remove: (id) => client.delete(`/backup/${id}`).then((r) => r.data),
}
