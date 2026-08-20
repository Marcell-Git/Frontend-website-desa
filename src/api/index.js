import client from './client.js'

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
    client.get('/kartu-keluarga', { params }).then((r) => r.data.data),
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
    client.get('/anggota', { params }).then((r) => r.data.data),
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
