import client from './client.js'

function normalizePaginated(d) {
  return { data: d?.data ?? [], pagination: d?.pagination ?? {} }
}

export const authApi = {
  login: (email, password) =>
    client.post('/auth/login', { email, password }).then((r) => r.data.data),
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
}

export const kkApi = {
  list: (params) =>
    client.get('/kartu-keluarga', { params }).then((r) => r.data.data).then(normalizePaginated),
  get: (id) => client.get(`/kartu-keluarga/${id}`).then((r) => r.data.data),
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
